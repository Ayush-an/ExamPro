const {
    StagingParticipant, ParticipantFile, History,
    Exam, Question, ExamGroup, Notice, Feedback, Assignment, Result, Subscription, Plan, UserRole, Role, Group, User, GroupMember, sequelize
} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateRandomPassword, generateBatchCode, generateFileCode } = require('../utils/helpers');

const uploadDir = path.join(__dirname, '../upload');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
exports.upload = multer({ storage });

// Helper: validate single email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

// Helper: validate mobile (7-15 digits, optional + prefix)
function isValidMobile(mobile) {
    if (!mobile) return true; // mobile optional
    return /^\+?[0-9]{7,15}$/.test(String(mobile).trim());
}

// Helper to log history
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

// ─── Helper: check org plan limits ───────────────────────────────────────────
async function getOrgPlanLimits(orgId) {
    const subscription = await Subscription.findOne({
        where: { organization_id: orgId, status_code: 'ACTIVE' },
        include: [{ model: Plan }],
        order: [['created_at', 'DESC']],
    });
    if (!subscription || !subscription.Plan) return null;
    return {
        participant_limit: subscription.Plan.participant_limit,
        active_participant_limit: subscription.Plan.active_participant_limit,
        question_limit: subscription.Plan.question_limit,
        plan_name: subscription.Plan.name,
    };
}

async function checkParticipantLimit(orgId) {
    const limits = await getOrgPlanLimits(orgId);
    if (!limits) return { allowed: true };

    const participantRole = await Role.findOne({ where: { code: 'PARTICIPANT', organization_id: orgId } });
    if (!participantRole) return { allowed: true };

    // Total Participants
    if (limits.participant_limit != null) {
        const total = await UserRole.count({ where: { role_id: participantRole.id, organization_id: orgId } });
        if (total >= limits.participant_limit) {
            return { allowed: false, reason: `Participant limit reached (${total}/${limits.participant_limit}). Please upgrade your plan.` };
        }
    }

    // Active Participants
    if (limits.active_participant_limit != null) {
        const active = await UserRole.count({
            where: { role_id: participantRole.id, organization_id: orgId },
            include: [{ model: User, where: { status_code: 'ACTIVE' } }]
        });
        if (active >= limits.active_participant_limit) {
            return { allowed: false, reason: `Active participant limit reached (${active}/${limits.active_participant_limit}). Please upgrade your plan.` };
        }
    }

    return { allowed: true };
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
    try {
        const orgId = req.user.organization_id;

        const totalGroups = await Group.count({ where: { organization_id: orgId, status_code: { [Op.ne]: 'REMOVED' } } });
        const totalExams = await Exam.count({ where: { organization_id: orgId, removed_at: null } });
        
        const participantRole = await Role.findOne({ where: { code: 'PARTICIPANT', organization_id: orgId } });
        let totalParticipants = 0;
        if (participantRole) {
            totalParticipants = await UserRole.count({ where: { role_id: participantRole.id, organization_id: orgId } });
        }

        const activeExams = await Exam.count({ 
            where: { 
                organization_id: orgId, 
                status_code: 'ACTIVE',
                removed_at: null 
            } 
        });

        const limits = await getOrgPlanLimits(orgId);
        const totalQuestions = await Question.count({ where: { organization_id: orgId } });

        res.json({
            totalGroups,
            totalExams,
            totalParticipants,
            totalQuestions,
            ActiveExams: activeExams,
            InactiveExams: totalExams - activeExams,
            limits
        });
    } catch (error) {
        console.error('getDashboardStats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ─── Groups ──────────────────────────────────────────────────────────────────
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            where: { organization_id: req.user.organization_id, status_code: { [Op.ne]: 'REMOVED' } },
            include: [{ model: GroupMember, attributes: ['id'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(groups);
    } catch (error) {
        console.error('getGroups Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

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
        res.status(500).json({ error: 'Server error' });
    }
};

exports.removeGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findOne({ where: { id, organization_id: req.user.organization_id } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        await group.update({ status_code: 'REMOVED' });
        res.json({ message: 'Group removed safely' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ─── Participants ────────────────────────────────────────────────────────────
exports.getParticipants = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const participantRole = await Role.findOne({ where: { code: 'PARTICIPANT', organization_id: orgId } });
        
        if (!participantRole) return res.json([]);

        const users = await User.findAll({
            include: [{
                model: Role,
                through: { attributes: [] },
                where: { id: participantRole.id }
            }],
            where: { organization_id: orgId, status_code: { [Op.ne]: 'REMOVED' } },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        console.error('getParticipants Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createSingleParticipant = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const changedBy = req.user.id;
        const changedByName = req.user.full_name || 'SuperUser';

        // Check plan limits
        const limitCheck = await checkParticipantLimit(orgId);
        if (!limitCheck.allowed) {
            return res.status(403).json({ error: limitCheck.reason });
        }

        let { group_ids, full_name, email, mobile } = req.body;

        if (!Array.isArray(group_ids) || group_ids.length === 0) return res.status(400).json({ error: 'Group selection required' });
        if (!full_name || !email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid Name and Email required' });

        const existing = await User.findOne({ where: { email, organization_id: orgId } });
        if (existing) return res.status(400).json({ error: 'Email already exists in this organization' });

        const user = await promoteToParticipant(orgId, {
            full_name, email, mobile,
            batch_code: 'MANUAL',
            group_ids,
            creator_id: changedBy,
            creator_name: changedByName
        });

        res.json({ message: 'Participant created successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ─── Exams ───────────────────────────────────────────────────────────────────
exports.getExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({
            where: { organization_id: req.user.organization_id, removed_at: null },
            include: [{ model: Group, through: { attributes: [] } }],
            order: [['created_at', 'DESC']]
        });
        res.json(exams);
    } catch (error) {
        console.error('getExams Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createExam = async (req, res) => {
    try {
        const { title, description, duration_minutes, group_ids, start_date, end_date } = req.body;
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

        if (Array.isArray(group_ids)) {
            for (const gid of group_ids) {
                await ExamGroup.create({
                    organization_id: req.user.organization_id,
                    exam_id: exam.id,
                    group_id: gid
                });
            }
        }

        res.json({ message: 'Exam created successfully', exam });
    } catch (err) {
        console.error('createExam Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.removeExam = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await Exam.findOne({ where: { id, organization_id: req.user.organization_id } });
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        await exam.update({ removed_at: new Date() });
        res.json({ message: 'Exam removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ─── Notices ─────────────────────────────────────────────────────────────────
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.findAll({
            where: { organization_id: req.user.organization_id },
            order: [['created_at', 'DESC']]
        });
        res.json(notices);
    } catch (error) {
        console.error('getNotices Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendNotice = async (req, res) => {
    try {
        const { title, message, target_type_code, group_id } = req.body;
        const notice = await Notice.create({
            organization_id: req.user.organization_id,
            title, message,
            notice_type_code: 'GENERAL',
            status_code: 'ACTIVE',
            sender_id: req.user.id,
            target_type_code: target_type_code || 'ALL',
            group_id: group_id || null,
        });
        res.json({ success: true, notice });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.uploadParticipants = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'File missing' });
        const orgId = req.user.organization_id;
        let groupIds = req.body.group_ids;
        if (typeof groupIds === 'string') {
            try { groupIds = JSON.parse(groupIds); } catch { groupIds = [groupIds]; }
        }
        groupIds = groupIds.map(Number).filter(Boolean);

        const workbook = xlsx.readFile(req.file.path);
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        // Check plan limits for entire batch
        const limits = await getOrgPlanLimits(orgId);
        if (limits && limits.participant_limit != null) {
            const participantRole = await Role.findOne({ where: { code: 'PARTICIPANT', organization_id: orgId } });
            if (participantRole) {
                const totalParticipants = await UserRole.count({ where: { role_id: participantRole.id, organization_id: orgId } });
                if (totalParticipants + rows.length > limits.participant_limit) {
                    return res.status(403).json({ error: `Upload exceeds participant limit. Current: ${totalParticipants}, File: ${rows.length}, Limit: ${limits.participant_limit}.` });
                }
            }
        }

        let created = 0;
        let skipped = [];

        for (const row of rows) {
            const email = (row.email || row.Email || '').trim().toLowerCase();
            const full_name = (row.name || row.Name || row.full_name || '').trim();
            if (!email || !full_name) continue;

            const existing = await User.findOne({ where: { email, organization_id: orgId } });
            if (existing) {
                skipped.push(email);
                continue;
            }

            await promoteToParticipant(orgId, {
                full_name, email,
                mobile: (row.mobile || row.Mobile || '').trim(),
                batch_code: 'UPLOAD',
                group_ids: groupIds,
                creator_id: req.user.id,
                creator_name: req.user.full_name
            });
            created++;
        }

        res.json({ message: 'Upload processed', created, skipped });
    } catch (err) {
        console.error('uploadParticipants Error:', err);
        res.status(500).json({ error: 'Server error during upload' });
    }
};

exports.getFeedbacks = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const feedbacks = await Feedback.findAll({
            where: { organization_id: orgId },
            order: [['created_at', 'DESC']]
        });
        // Mocking senderName for now if not joined
        res.json(feedbacks);
    } catch (err) {
        console.error('getFeedbacks:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        const { title, description, groupId } = req.body;
        const orgId = req.user.organization_id;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const assignment = await Assignment.create({
            organization_id: orgId,
            title,
            description,
            group_id: groupId,
            file_url: fileUrl,
            created_by: req.user.id
        });

        res.json({ message: 'Assignment created successfully', assignment });
    } catch (err) {
        console.error('createAssignment:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
