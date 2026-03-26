const {
    Group, User, Role, UserRole, GroupMember,
    StagingParticipant, ParticipantFile, History,
    Exam, Question, ExamGroup, Category, Topic, Op: _Op,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateRandomPassword, generateBatchCode, generateFileCode } = require('../utils/helpers');

// ─── Upload dir ─────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../upload');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
exports.upload = multer({ storage });

// ─── Helper: log to History ──────────────────────────────────────────────────
async function logHistory(orgId, entityType, entityId, entityName, action, opts = {}) {
    try {
        await History.create({
            organization_id: orgId,
            entity_type: entityType,
            entity_id: entityId,
            entity_name: entityName,
            action,
            file_name: opts.file_name || null,
            file_code: opts.file_code || null,
            changed_by_id: opts.changed_by_id || null,
            changed_by_name: opts.changed_by_name || null,
            detail: opts.detail || null,
        });
    } catch (e) {
        console.error('logHistory error:', e.message);
    }
}

// ─── Helper: validate single email ───────────────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

// ─── Helper: validate mobile (7-15 digits, optional + prefix) ────────────────
function isValidMobile(mobile) {
    if (!mobile) return true; // mobile optional
    return /^\+?[0-9]{7,15}$/.test(String(mobile).trim());
}

/**
 * Shared helper to promote a record (either from Excel row or Staging) to a real User
 */
async function promoteToParticipant(orgId, data, opts = {}) {
    const { full_name, email, mobile, batch_code, group_ids, creator_id, creator_name, file_code, file_name } = data;

    // 1. Ensure Role exists
    const [participantRole] = await Role.findOrCreate({
        where: { code: 'PARTICIPANT', organization_id: orgId },
        defaults: { name: 'Participant', status_code: 'ACTIVE' },
    });

    // 2. Create User
    const passwordPlain = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    const user = await User.create({
        organization_id: orgId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        mobile: mobile ? mobile.trim() : null,
        status_code: 'ACTIVE',
        upload_batch_code: batch_code || 'UPLOAD',
    });

    // 3. Assign Role
    await UserRole.create({
        organization_id: orgId,
        user_id: user.id,
        role_id: participantRole.id,
    });

    // 4. Assign Groups
    const gids = Array.isArray(group_ids) ? group_ids : [group_ids].filter(Boolean);
    for (const gid of gids) {
        await GroupMember.findOrCreate({
            where: { organization_id: orgId, group_id: Number(gid), user_id: user.id },
            defaults: {
                organization_id: orgId,
                group_id: Number(gid),
                user_id: user.id,
                status_code: 'ACTIVE',
                role_code: 'MEMBER',
            },
        });
    }

    // 5. Log History
    await logHistory(orgId, 'PARTICIPANT', user.id, user.full_name, 'CREATE', {
        file_name: file_name || null,
        file_code: file_code || null,
        changed_by_id: creator_id || null,
        changed_by_name: creator_name || null,
        detail: {
            email: user.email,
            groups: gids,
            method: file_code ? 'UPLOAD_AUTO' : (batch_code === 'MANUAL' ? 'MANUAL' : 'STAGING_APPROVE'),
            source_batch: batch_code
        },
    });

    return user;
}

// ═══════════════════════════════════════════════════════════════════════════
//  GROUPS
// ═══════════════════════════════════════════════════════════════════════════

exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const group = await Group.create({
            organization_id: req.user.organization_id,
            name,
            status_code: 'ACTIVE',
            created_by: req.user.id,
        });
        res.json({ message: 'Group created', group });
    } catch (err) {
        console.error('createGroup error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({ where: { organization_id: req.user.organization_id } });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.removeGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await Group.destroy({ where: { id, organization_id: req.user.organization_id } });
        res.json({ message: 'Group removed safely' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  PARTICIPANTS — Excel Upload
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /admin/participants/upload
 * Body: group_ids (JSON array or comma-sep), file_name (editable), file (multipart)
 * Generates a XX#### file_code, saves all rows to staging with full validation.
 * Clean rows → status=PENDING, issue rows → status=ERROR
 */
exports.uploadParticipants = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Please upload an Excel/CSV file' });

        const orgId = req.user.organization_id;
        const changedBy = req.user.id;
        const changedByName = req.user.full_name || req.user.name || 'Admin';

        // Parse group_ids
        let groupIds = req.body.group_ids;
        if (typeof groupIds === 'string') {
            try { groupIds = JSON.parse(groupIds); } catch { groupIds = groupIds.split(',').map(s => s.trim()); }
        }
        if (!Array.isArray(groupIds) || groupIds.length === 0) {
            return res.status(400).json({ error: 'Please select at least one group' });
        }
        groupIds = groupIds.map(Number).filter(Boolean);

        // File name / code
        const fileCode = generateFileCode();
        const originalName = req.file.originalname;
        const editedName = (req.body.file_name || '').trim() || path.parse(originalName).name;
        const storedFileName = `${fileCode}_${editedName}`;

        // Parse Excel / CSV
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Collect emails and mobiles in this batch for duplicate detection
        const batchEmails = new Map();   // email → first row index
        const batchMobiles = new Map();  // mobile → first row index

        // Fetch existing emails / mobiles from users table for this org
        const existingUsers = await User.findAll({
            where: { organization_id: orgId },
            attributes: ['email', 'mobile'],
        });
        const existingEmails = new Set(existingUsers.map(u => (u.email || '').toLowerCase()));
        const existingMobiles = new Set(existingUsers.map(u => u.mobile).filter(Boolean));

        const batchCode = generateBatchCode();
        let autoApprovedCount = 0;
        let errorCount = 0;

        for (let idx = 0; idx < rows.length; idx++) {
            const row = rows[idx];
            const fullName = (row.Name || row.name || row.full_name || '').trim();
            const email = (row.Email || row.email || '').trim().toLowerCase();
            const mobile = String(row.Mobile || row.mobile || row.Phone || row.phone || '').trim();

            const issues = [];
            const issueTypes = [];

            // Validation
            if (!fullName) { issues.push('Missing name'); issueTypes.push('MISSING_NAME'); }
            if (!email) { issues.push('Missing email'); issueTypes.push('MISSING_EMAIL'); }
            else if (!isValidEmail(email)) { issues.push('Invalid email format'); issueTypes.push('INVALID_EMAIL'); }
            if (mobile && !isValidMobile(mobile)) { issues.push('Invalid mobile number'); issueTypes.push('INVALID_MOBILE'); }

            // Duplicate within batch
            if (email && isValidEmail(email)) {
                if (batchEmails.has(email)) {
                    issues.push(`Duplicate email in file (row ${batchEmails.get(email) + 1})`);
                    issueTypes.push('DUPLICATE_EMAIL_IN_FILE');
                } else {
                    batchEmails.set(email, idx);
                }
            }
            if (mobile && isValidMobile(mobile)) {
                if (batchMobiles.has(mobile)) {
                    issues.push(`Duplicate mobile in file (row ${batchMobiles.get(mobile) + 1})`);
                    issueTypes.push('DUPLICATE_MOBILE_IN_FILE');
                } else {
                    batchMobiles.set(mobile, idx);
                }
            }

            // Duplicate in existing DB
            if (email && existingEmails.has(email)) {
                issues.push('Email already exists in system');
                issueTypes.push('DUPLICATE_EMAIL_IN_DB');
            }
            if (mobile && existingMobiles.has(mobile)) {
                issues.push('Mobile already exists in system');
                issueTypes.push('DUPLICATE_MOBILE_IN_DB');
            }

            if (issues.length === 0) {
                // Auto-promote to Participant
                await promoteToParticipant(orgId, {
                    full_name: fullName,
                    email,
                    mobile,
                    batch_code: batchCode,
                    group_ids: groupIds,
                    creator_id: changedBy,
                    creator_name: changedByName,
                    file_code: fileCode,
                    file_name: storedFileName
                });
                autoApprovedCount++;
            } else {
                // Save to Staging
                await StagingParticipant.create({
                    organization_id: orgId,
                    batch_code: batchCode,
                    file_code: fileCode,
                    file_name: storedFileName,
                    group_id: groupIds[0],
                    group_ids: groupIds,
                    full_name: fullName || 'Unknown',
                    email: email || 'invalid@invalid.com',
                    mobile: mobile || null,
                    status_code: 'ERROR',
                    issues: JSON.stringify(issues),
                    issue_type: issueTypes.join(','),
                });
                errorCount++;
            }
        }

        // Save to ParticipantFile
        await ParticipantFile.create({
            organization_id: orgId,
            file_code: fileCode,
            file_name: storedFileName,
            original_filename: originalName,
            total_rows: rows.length,
            error_rows: errorCount,
            pending_rows: 0,
            approved_rows: autoApprovedCount,
            created_by: changedBy,
            group_ids: groupIds,
        });

        // Log history
        await logHistory(orgId, 'PARTICIPANT', null, storedFileName, 'UPLOAD', {
            file_name: storedFileName,
            file_code: fileCode,
            changed_by_id: changedBy,
            changed_by_name: changedByName,
            detail: { total: rows.length, errors: errorCount, auto_approved: autoApprovedCount, groups: groupIds },
        });

        res.json({
            message: 'File processed',
            batch_code: batchCode,
            file_code: fileCode,
            file_name: storedFileName,
            total: rows.length,
            errors: errorCount,
            approved: autoApprovedCount,
        });
    } catch (err) {
        console.error('uploadParticipants error:', err);
        res.status(500).json({ error: 'Server error parsing file' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  PARTICIPANTS — Single Create (direct to users table)
// ═══════════════════════════════════════════════════════════════════════════

exports.createSingleParticipant = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const changedBy = req.user.id;
        const changedByName = req.user.full_name || req.user.name || 'Admin';

        let { group_ids, group_id, full_name, email, mobile } = req.body;

        // Support both single group_id and multi group_ids
        let groupIds = group_ids;
        if (typeof groupIds === 'string') {
            try { groupIds = JSON.parse(groupIds); } catch { groupIds = [groupIds]; }
        }
        if (!Array.isArray(groupIds) || groupIds.length === 0) {
            groupIds = group_id ? [group_id] : [];
        }
        groupIds = groupIds.map(Number).filter(Boolean);

        if (groupIds.length === 0) return res.status(400).json({ error: 'Please select at least one group' });
        if (!full_name) return res.status(400).json({ error: 'Full name is required' });
        if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
        if (mobile && !isValidMobile(mobile)) return res.status(400).json({ error: 'Invalid mobile number' });

        // Duplicate check
        const existing = await User.findOne({ where: { email: email.trim().toLowerCase(), organization_id: orgId } });
        if (existing) return res.status(400).json({ error: 'Email already registered in this organization' });

        const user = await promoteToParticipant(orgId, {
            full_name,
            email,
            mobile,
            batch_code: 'MANUAL',
            group_ids: groupIds,
            creator_id: changedBy,
            creator_name: changedByName
        });

        res.json({ message: 'Participant created successfully', userId: user.id });
    } catch (err) {
        console.error('createSingleParticipant error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  STAGING — Get (ERROR records only by default)
// ═══════════════════════════════════════════════════════════════════════════

exports.getStagingParticipants = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const { all, batch_code, file_code } = req.query;

        const where = { organization_id: orgId };
        if (!all || all !== 'true') where.status_code = 'ERROR'; // show only issues by default
        if (batch_code) where.batch_code = batch_code;
        if (file_code) where.file_code = file_code;

        const records = await StagingParticipant.findAll({
            where,
            include: [{ model: Group, attributes: ['id', 'name'], required: false }],
            order: [['created_at', 'DESC']],
        });

        const groups = await Group.findAll({
            where: { organization_id: orgId },
            attributes: ['id', 'name'],
        });

        res.json({
            success: true,
            data: {
                participants: records.map(r => ({
                    ...r.toJSON(),
                    groupName: r.Group?.name || null,
                    issues: r.issues ? JSON.parse(r.issues) : [],
                })),
                groups,
            },
        });
    } catch (err) {
        console.error('getStagingParticipants error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  STAGING — Update (admin fixes error record)
// ═══════════════════════════════════════════════════════════════════════════

exports.updateStagingParticipant = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const changedBy = req.user.id;
        const changedByName = req.user.full_name || req.user.name || 'Admin';
        const { id } = req.params;

        const record = await StagingParticipant.findOne({ where: { id, organization_id: orgId } });
        if (!record) return res.status(404).json({ error: 'Record not found' });

        const fullName = (req.body.full_name || record.full_name || '').trim();
        const email = (req.body.email || record.email || '').trim().toLowerCase();
        const mobile = (req.body.mobile || record.mobile || '').trim();
        const groupId = req.body.group_id || record.group_id;

        // Re-validate
        const issues = [];
        const issueTypes = [];

        if (!fullName) { issues.push('Missing name'); issueTypes.push('MISSING_NAME'); }
        if (!email || !isValidEmail(email)) { issues.push('Invalid email format'); issueTypes.push('INVALID_EMAIL'); }
        if (mobile && !isValidMobile(mobile)) { issues.push('Invalid mobile number'); issueTypes.push('INVALID_MOBILE'); }

        // Check duplicates in DB (exclude current staging record)
        const existingUser = await User.findOne({
            where: { email, organization_id: orgId },
        });
        if (existingUser) { issues.push('Email already exists in system'); issueTypes.push('DUPLICATE_EMAIL_IN_DB'); }

        // Check duplicate within batch (exclude self)
        const batchDup = await StagingParticipant.findOne({
            where: {
                organization_id: orgId,
                batch_code: record.batch_code,
                email,
                id: { [Op.ne]: Number(id) },
            },
        });
        if (batchDup) { issues.push('Duplicate email in file'); issueTypes.push('DUPLICATE_EMAIL_IN_FILE'); }

        const isNowClean = issues.length === 0;

        if (isNowClean) {
            // Auto-promote and delete from staging
            await promoteToParticipant(orgId, {
                full_name: fullName,
                email,
                mobile,
                batch_code: record.batch_code,
                group_ids: Number(groupId) === Number(record.group_id) ? record.group_ids : [groupId],
                creator_id: changedBy,
                creator_name: changedByName,
                file_code: record.file_code,
                file_name: record.file_name
            });

            // Update ParticipantFile counts (inc approved, dec error)
            await ParticipantFile.update(
                {
                    approved_rows: sequelize.literal('approved_rows + 1'),
                    error_rows: sequelize.literal('error_rows - 1')
                },
                { where: { file_code: record.file_code, organization_id: orgId } }
            );

            await record.destroy();

            return res.json({
                success: true,
                message: 'Record fixed and promoted to Participant',
                promoted: true
            });
        }

        const old = { full_name: record.full_name, email: record.email, mobile: record.mobile };
        await record.update({
            full_name: fullName,
            email,
            mobile: mobile || null,
            group_id: groupId,
            issues: JSON.stringify(issues),
            issue_type: issueTypes.join(',') || null,
            status_code: 'ERROR',
        });

        await logHistory(orgId, 'PARTICIPANT', record.id, fullName, 'UPDATE', {
            file_name: record.file_name,
            file_code: record.file_code,
            changed_by_id: changedBy,
            changed_by_name: changedByName,
            detail: { old, updated: { full_name: fullName, email, mobile }, issues },
        });

        res.json({
            success: true,
            message: 'Record updated but still has issues',
            record: { ...record.toJSON(), issues },
        });
    } catch (err) {
        console.error('updateStagingParticipant error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  STAGING — Approve single record (PENDING → users table)
// ═══════════════════════════════════════════════════════════════════════════

exports.approveStagingParticipant = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const changedBy = req.user.id;
        const changedByName = req.user.full_name || req.user.name || 'Admin';
        const { id } = req.params;

        const record = await StagingParticipant.findOne({ where: { id, organization_id: orgId } });
        if (!record) return res.status(404).json({ error: 'Record not found' });
        if (record.status_code === 'ERROR') return res.status(400).json({ error: 'Record still has issues — fix them first' });
        const user = await promoteToParticipant(orgId, {
            full_name: record.full_name,
            email: record.email,
            mobile: record.mobile,
            batch_code: record.batch_code,
            group_ids: record.group_ids || (record.group_id ? [record.group_id] : []),
            creator_id: changedBy,
            creator_name: changedByName,
            file_code: record.file_code,
            file_name: record.file_name
        });

        // Update ParticipantFile counts
        const inc = record.status_code === 'PENDING' ? { pending_rows: sequelize.literal('pending_rows - 1') } : { error_rows: sequelize.literal('error_rows - 1') };
        await ParticipantFile.update(
            {
                approved_rows: sequelize.literal('approved_rows + 1'),
                ...inc
            },
            { where: { file_code: record.file_code, organization_id: orgId } }
        );

        await record.destroy();

        res.json({ success: true, message: 'Participant approved and added', userId: user.id });
    } catch (err) {
        console.error('approveStagingParticipant error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  STAGING — Approve all PENDING in a batch
// ═══════════════════════════════════════════════════════════════════════════

exports.approveAllStagingBatch = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const changedBy = req.user.id;
        const changedByName = req.user.full_name || req.user.name || 'Admin';
        const { batch_code } = req.body;

        if (!batch_code) return res.status(400).json({ error: 'batch_code is required' });

        const records = await StagingParticipant.findAll({
            where: { organization_id: orgId, batch_code, status_code: 'PENDING' },
        });

        if (records.length === 0) return res.status(400).json({ error: 'No pending records in this batch' });

        let created = 0;
        let fileCode = null;
        for (const rec of records) {
            fileCode = rec.file_code;
            await promoteToParticipant(orgId, {
                full_name: rec.full_name,
                email: rec.email,
                mobile: rec.mobile,
                batch_code: batch_code,
                group_ids: rec.group_ids || (rec.group_id ? [rec.group_id] : []),
                creator_id: changedBy,
                creator_name: changedByName,
                file_code: rec.file_code,
                file_name: rec.file_name
            });
            await rec.destroy();
            created++;
        }

        if (fileCode) {
            await ParticipantFile.update(
                {
                    approved_rows: sequelize.literal(`approved_rows + ${created}`),
                    pending_rows: sequelize.literal(`pending_rows - ${created}`)
                },
                { where: { file_code: fileCode, organization_id: orgId } }
            );
        }

        res.json({ success: true, message: `${created} participants approved and added`, created });
    } catch (err) {
        console.error('approveAllStagingBatch error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  STAGING — Confirm (legacy compat)
// ═══════════════════════════════════════════════════════════════════════════

exports.confirmParticipants = exports.approveAllStagingBatch;

// ═══════════════════════════════════════════════════════════════════════════
//  EXAMS
// ═══════════════════════════════════════════════════════════════════════════

exports.createExam = async (req, res) => {
    try {
        const { title, description, duration_minutes, group_id, start_date, end_date } = req.body;
        const examCode = generateBatchCode();

        const exam = await Exam.create({
            organization_id: req.user.organization_id,
            title, description,
            status_code: 'ACTIVE',
            duration_minutes,
            exam_code: examCode,
            start_date, end_date,
            created_by: req.user.id
        });

        if (group_id) {
            await ExamGroup.create({
                organization_id: req.user.organization_id,
                exam_id: exam.id,
                group_id
            });
        }

        res.json({ message: 'Exam created', exam });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({ where: { organization_id: req.user.organization_id } });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════

exports.getDashboardStats = async (req, res) => {
    try {
        const orgId = req.user.organization_id;

        const participantRole = await Role.findOne({ where: { code: 'PARTICIPANT', organization_id: orgId } });
        const superUserRole = await Role.findOne({ where: { code: 'SUPERUSER', organization_id: orgId } });

        // Total Counts
        const totalGroups = await Group.count({ where: { organization_id: orgId } });
        const totalExams = await Exam.count({ where: { organization_id: orgId } });
        const totalCategories = await Category.count({ where: { organization_id: orgId } });
        const totalTopics = await Topic.count({ where: { organization_id: orgId } });
        const totalQuestions = await Question.count({ where: { organization_id: orgId } });

        // Active Counts
        const activeGroups = await Group.count({ where: { organization_id: orgId, status_code: 'ACTIVE' } });
        const activeExams = await Exam.count({ where: { organization_id: orgId, status_code: 'ACTIVE' } });

        let totalParticipants = 0;
        let activeParticipants = 0;
        if (participantRole) {
            totalParticipants = await UserRole.count({ where: { role_id: participantRole.id, organization_id: orgId } });
            activeParticipants = await UserRole.count({
                where: { role_id: participantRole.id, organization_id: orgId },
                include: [{ model: User, where: { status_code: 'ACTIVE' } }]
            });
        }

        let totalSuperUsers = 0;
        let activeSuperUsers = 0;
        if (superUserRole) {
            totalSuperUsers = await UserRole.count({ where: { role_id: superUserRole.id, organization_id: orgId } });
            activeSuperUsers = await UserRole.count({
                where: { role_id: superUserRole.id, organization_id: orgId },
                include: [{ model: User, where: { status_code: 'ACTIVE' } }]
            });
        }

        // Exam Timing Stats
        const now = new Date();
        const upcomingExams = await Exam.count({
            where: {
                organization_id: orgId,
                start_date: { [Op.gt]: now }
            }
        });
        const completedExams = await Exam.count({
            where: {
                organization_id: orgId,
                end_date: { [Op.lt]: now }
            }
        });

        res.json({
            totalGroups, activeGroups,
            totalParticipants, activeParticipants,
            totalExams, activeExams, upcomingExams, completedExams,
            totalCategories, totalTopics, totalQuestions,
            totalSuperUsers, activeSuperUsers
        });
    } catch (err) {
        console.error('getDashboardStats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
//  SUPERUSERS / NOTICES / FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

exports.createSuperUser = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        const orgId = req.user.organization_id;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // 1. Check if user already exists
        const existing = await User.findOne({ where: { email: email.toLowerCase(), organization_id: orgId } });
        if (existing) return res.status(400).json({ message: 'Email already registered in this organization' });

        // 2. Find or create SUPERUSER role
        const [superUserRole] = await Role.findOrCreate({
            where: { code: 'SUPERUSER', organization_id: orgId },
            defaults: { name: 'Super User', status_code: 'ACTIVE', is_system: true }
        });

        // 3. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            organization_id: orgId,
            full_name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            mobile: mobile ? mobile.trim() : null,
            status_code: 'ACTIVE',
            approved: true
        });

        // 4. Assign Role
        await UserRole.create({
            organization_id: orgId,
            user_id: user.id,
            role_id: superUserRole.id,
            assigned_by: req.user.id
        });

        // 5. Log History
        await logHistory(orgId, 'SUPERUSER', user.id, user.full_name, 'CREATE', {
            changed_by_id: req.user.id,
            changed_by_name: req.user.full_name || 'Admin',
            detail: { email: user.email }
        });

        res.status(201).json({ message: 'SuperUser created successfully', superUser: user });
    } catch (err) {
        console.error('createSuperUser error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getSuperUsers = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const superUserRole = await Role.findOne({ where: { code: 'SUPERUSER', organization_id: orgId } });
        if (!superUserRole) return res.json({ superUsers: [] });

        const userRoles = await UserRole.findAll({
            where: { role_id: superUserRole.id, organization_id: orgId },
            include: [{ model: User, attributes: ['id', 'full_name', 'email', 'mobile', 'status_code'] }]
        });

        const superUsers = userRoles
            .filter(ur => ur.User)
            .map(ur => ({ ...ur.User.toJSON(), name: ur.User.full_name }));

        res.json({ superUsers });
    } catch (err) {
        console.error('getSuperUsers error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getNotices = async (req, res) => {
    try {
        const { Notice } = require('../models');
        const notices = await Notice.findAll({
            where: { organization_id: req.user.organization_id },
            order: [['created_at', 'DESC']]
        });
        res.json(notices);
    } catch (err) {
        console.error('getNotices error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendNotice = async (req, res) => {
    try {
        const { Notice } = require('../models');
        const { title, message, target_type_code, receiver_id, group_id } = req.body;
        const notice = await Notice.create({
            organization_id: req.user.organization_id,
            title, message,
            notice_type_code: 'GENERAL',
            status_code: 'ACTIVE',
            sender_id: req.user.id,
            target_type_code: target_type_code || 'ALL',
            receiver_id: receiver_id || null,
            group_id: group_id || null,
        });
        res.json({ success: true, notice });
    } catch (err) {
        console.error('sendNotice error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendFeedback = async (req, res) => {
    try {
        const { Feedback, User: UserModel } = require('../models');
        const { message } = req.body;
        const superadmin = await UserModel.findOne({ where: { organization_id: 0 } }).catch(() => null);
        const receiver_id = superadmin ? superadmin.id : req.user.id;
        const feedback = await Feedback.create({
            organization_id: req.user.organization_id,
            message,
            sender_id: req.user.id,
            receiver_id,
            feedback_type_code: 'ADMIN_TO_SUPERADMIN',
            status_code: 'PENDING',
        });
        res.json({ success: true, feedback });
    } catch (err) {
        console.error('sendFeedback error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
