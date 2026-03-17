const {
    Exam, ExamGroup, Group, GroupMember, Question, QuestionOption,
    Notice, Feedback, Assignment, Result, Answer, ExamAttempt,
    User, Role, UserRole, StagingParticipant
} = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const xlsx = require('xlsx');
const { generateBatchCode } = require('../utils/helpers');

// ─── Multer setup ──────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'upload/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
exports.upload = multer({ storage });

// ═══════════════════════════════════════════════════════════════
// EXAM ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({
            where: {
                organization_id: req.user.organization_id,
                removed_at: null
            },
            include: [{ model: Group, through: { attributes: [] } }],
            order: [['created_at', 'DESC']]
        });
        res.json({ exams });
    } catch (err) {
        console.error('getExams:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createExam = async (req, res) => {
    try {
        const { title, description, duration_minutes, duration, groupIds, group_id, start_date, end_date, scheduled, status, status_code } = req.body;
        const examCode = generateBatchCode();

        // Determine status: if scheduled with dates, set SCHEDULED; otherwise ACTIVE
        let finalStatus = status_code || status || 'ACTIVE';
        if (scheduled && start_date) {
            finalStatus = 'SCHEDULED';
        }

        const exam = await Exam.create({
            organization_id: req.user.organization_id,
            title, description,
            status_code: finalStatus,
            duration_minutes: duration_minutes || duration || 0,
            exam_code: examCode,
            start_date: start_date || null,
            end_date: end_date || null,
            created_by: req.user.id
        });

        // Support multiple groupIds
        const gids = groupIds || (group_id ? [group_id] : []);
        for (const gid of gids) {
            await ExamGroup.create({
                organization_id: req.user.organization_id,
                exam_id: exam.id,
                group_id: parseInt(gid)
            });
        }

        // Re-fetch with groups
        const created = await Exam.findByPk(exam.id, {
            include: [{ model: Group, through: { attributes: [] } }]
        });
        res.json({ message: 'Exam created', exam: created });
    } catch (err) {
        console.error('createExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await Exam.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        const { title, description, duration_minutes, duration, status, status_code, start_date, end_date, groupIds, selectedGroups } = req.body;

        // Build update object with only allowed fields
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (duration_minutes !== undefined || duration !== undefined) updateData.duration_minutes = duration_minutes || duration;
        if (status_code !== undefined || status !== undefined) updateData.status_code = status_code || status;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;

        await exam.update(updateData);

        // Handle group reassignment
        const gids = groupIds || selectedGroups;
        if (gids && Array.isArray(gids)) {
            await ExamGroup.destroy({ where: { exam_id: id } });
            for (const gid of gids) {
                await ExamGroup.create({
                    organization_id: req.user.organization_id,
                    exam_id: parseInt(id),
                    group_id: parseInt(gid)
                });
            }
        }

        // Re-fetch with groups
        const updated = await Exam.findByPk(id, {
            include: [{ model: Group, through: { attributes: [] } }]
        });
        res.json({ message: 'Exam updated', exam: updated });
    } catch (err) {
        console.error('updateExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await Exam.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        await exam.update({ removed_at: new Date(), removed_by: req.user.id, status_code: 'REMOVED' });

        // Add Notification
        await Notice.create({
            organization_id: req.user.organization_id,
            title: 'Exam Removed',
            message: `The exam "${exam.title}" has been removed/cancelled.`,
            notice_type_code: 'GENERAL',
            status_code: 'ACTIVE',
            sender_id: req.user.id,
            target_type_code: 'ALL'
        });

        res.json({ message: 'Exam removed' });
    } catch (err) {
        console.error('deleteExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRemovedExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({
            where: { organization_id: req.user.organization_id, removed_at: { [Op.ne]: null } },
            include: [{ model: Group, through: { attributes: [] } }],
            order: [['created_at', 'DESC']]
        });
        res.json(exams);
    } catch (err) {
        console.error('getRemovedExams:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.submitExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body; // array of { question_id, selected_option_id, answer_text }
        const orgId = req.user.organization_id;
        const userId = req.user.id;

        const exam = await Exam.findByPk(id);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        // Find or create attempt
        let attempt = await ExamAttempt.findOne({
            where: { exam_id: id, user_id: userId, organization_id: orgId }
        });
        if (!attempt) {
            // Find the user's group for this exam
            const examGroup = await ExamGroup.findOne({ where: { exam_id: id, organization_id: orgId } });
            attempt = await ExamAttempt.create({
                organization_id: orgId,
                exam_id: id,
                user_id: userId,
                group_id: examGroup ? examGroup.group_id : 0,
                started_at: new Date(),
                status_code: 'SUBMITTED'
            });
        }
        attempt.submitted_at = new Date();
        attempt.status_code = 'SUBMITTED';
        await attempt.save();

        // Save answers
        let correct = 0, wrong = 0, obtained = 0;
        if (answers && Array.isArray(answers)) {
            for (const ans of answers) {
                let isCorrect = false;
                if (ans.selected_option_id) {
                    const option = await QuestionOption.findByPk(ans.selected_option_id);
                    isCorrect = option ? option.is_correct : false;
                }
                await Answer.create({
                    organization_id: orgId,
                    exam_id: parseInt(id),
                    question_id: ans.question_id,
                    user_id: userId,
                    selected_option_id: ans.selected_option_id || null,
                    answer_text: ans.answer_text || null,
                    is_correct: isCorrect
                });
                if (isCorrect) { correct++; obtained++; } else { wrong++; }
            }
        }

        // Create result
        const totalMarks = answers ? answers.length : 0;
        const startTime = attempt.started_at || new Date();
        const endTime = new Date();
        const completionTime = Math.floor((endTime - new Date(startTime)) / 1000);

        await Result.create({
            organization_id: orgId,
            exam_id: parseInt(id),
            group_id: attempt.group_id,
            user_id: userId,
            total_marks: totalMarks,
            obtained_marks: obtained,
            score: totalMarks > 0 ? ((obtained / totalMarks) * 100).toFixed(2) : 0,
            correct_answers: correct,
            wrong_answers: wrong,
            exam_start_time: startTime,
            exam_end_time: endTime,
            completion_time_seconds: completionTime,
            result_status_code: 'COMPLETED'
        });

        res.json({ message: 'Exam submitted successfully', correct, wrong, total: totalMarks });
    } catch (err) {
        console.error('submitExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// GROUP ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getGroups = async (req, res) => {
    try {
        const orgId = req.query.organizationId || req.user.organization_id;
        const groups = await Group.findAll({
            where: { organization_id: orgId, status_code: { [Op.ne]: 'REMOVED' } }
        });
        res.json(groups);
    } catch (err) {
        console.error('getGroups:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;
        const group = await Group.create({
            organization_id: req.user.organization_id,
            name,
            description: description || null,
            status_code: 'ACTIVE',
            start_date: startDate || null,
            end_date: endDate || null,
            created_by: req.user.id
        });
        res.json({ message: 'Group created', group });
    } catch (err) {
        console.error('createGroup:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        const { name, description, startDate, endDate } = req.body;
        await group.update({
            name: name || group.name,
            description: description !== undefined ? description : group.description,
            start_date: startDate || group.start_date,
            end_date: endDate || group.end_date
        });
        res.json({ message: 'Group updated', group });
    } catch (err) {
        console.error('updateGroup:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!group) return res.status(404).json({ error: 'Group not found' });
        await group.update({ status_code: 'REMOVED' });
        res.json({ message: 'Group removed' });
    } catch (err) {
        console.error('deleteGroup:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRemovedGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            where: { organization_id: req.user.organization_id, status_code: 'REMOVED' }
        });
        res.json(groups);
    } catch (err) {
        console.error('getRemovedGroups:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getGroupBatches = async (req, res) => {
    try {
        const groups = await Group.findAll({
            where: { organization_id: req.user.organization_id },
            attributes: ['id', 'name']
        });
        res.json(groups);
    } catch (err) {
        console.error('getGroupBatches:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// QUESTION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getQuestionsByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const questions = await Question.findAll({
            where: { exam_id: examId, organization_id: req.user.organization_id },
            include: [{ model: QuestionOption }]
        });
        res.json(questions);
    } catch (err) {
        console.error('getQuestionsByExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const { exam_id, question_text, question_type_code, difficulty_code, marks, options } = req.body;
        const question = await Question.create({
            organization_id: req.user.organization_id,
            exam_id,
            question_text,
            question_type_code: question_type_code || 'MCQ',
            difficulty_code: difficulty_code || 'MEDIUM',
            marks: marks || 1,
            created_by: req.user.id
        });
        if (options && Array.isArray(options)) {
            for (let i = 0; i < options.length; i++) {
                await QuestionOption.create({
                    organization_id: req.user.organization_id,
                    question_id: question.id,
                    option_text: options[i].text || options[i].option_text,
                    is_correct: options[i].is_correct || false,
                    sort_order: i
                });
            }
        }
        const created = await Question.findByPk(question.id, {
            include: [{ model: QuestionOption }]
        });
        res.json({ message: 'Question created', question: created });
    } catch (err) {
        console.error('createQuestion:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.uploadQuestions = async (req, res) => {
    try {
        const { examId } = req.params;
        if (!req.file) return res.status(400).json({ error: 'Please upload a file' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        let count = 0;

        for (const row of data) {
            const q = await Question.create({
                organization_id: req.user.organization_id,
                exam_id: parseInt(examId),
                question_text: row.Question || row.question_text || 'No text',
                question_type_code: row.Type || 'MCQ',
                difficulty_code: row.Difficulty || 'MEDIUM',
                marks: row.Marks || 1,
                created_by: req.user.id,
                upload_batch_id: null
            });
            // Create options from columns A, B, C, D with Answer marking correct
            const optionCols = ['A', 'B', 'C', 'D'];
            for (let i = 0; i < optionCols.length; i++) {
                const optText = row[optionCols[i]];
                if (optText) {
                    await QuestionOption.create({
                        organization_id: req.user.organization_id,
                        question_id: q.id,
                        option_text: String(optText),
                        is_correct: String(row.Answer || '').toUpperCase() === optionCols[i],
                        sort_order: i
                    });
                }
            }
            count++;
        }
        res.json({ message: `${count} questions uploaded`, count });
    } catch (err) {
        console.error('uploadQuestions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await QuestionOption.destroy({ where: { question_id: id } });
        await Question.destroy({ where: { id, organization_id: req.user.organization_id } });
        res.json({ message: 'Question deleted' });
    } catch (err) {
        console.error('deleteQuestion:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getQuestionBatches = async (req, res) => {
    try {
        const questions = await Question.findAll({
            where: { organization_id: req.user.organization_id },
            attributes: ['upload_batch_id'],
            group: ['upload_batch_id']
        });
        res.json(questions);
    } catch (err) {
        console.error('getQuestionBatches:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// NOTICE ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getMyNotices = async (req, res) => {
    try {
        const userId = req.user.id;
        const orgId = req.user.organization_id;

        const groupMemberships = await GroupMember.findAll({
            where: { user_id: userId, organization_id: orgId },
            attributes: ['group_id']
        });
        const groupIds = groupMemberships.map(gm => gm.group_id);

        const notices = await Notice.findAll({
            where: {
                organization_id: orgId,
                [Op.or]: [
                    { receiver_id: userId },
                    ...(groupIds.length > 0 ? [{ group_id: { [Op.in]: groupIds } }] : []),
                    { target_type_code: 'ALL' }
                ]
            },
            order: [['created_at', 'DESC']]
        });
        res.json(notices);
    } catch (err) {
        console.error('getMyNotices:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendNotice = async (req, res) => {
    try {
        const { title, message, target_type_code, receiver_id, group_id } = req.body;
        const notice = await Notice.create({
            organization_id: req.user.organization_id,
            title: title || 'Notice',
            message,
            notice_type_code: 'GENERAL',
            status_code: 'ACTIVE',
            sender_id: req.user.id,
            target_type_code: target_type_code || 'ALL',
            receiver_id: receiver_id || null,
            group_id: group_id || null
        });
        res.json({ success: true, notice });
    } catch (err) {
        console.error('sendNotice:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// FEEDBACK ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getMyFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({
            where: {
                organization_id: req.user.organization_id,
                [Op.or]: [
                    { sender_id: req.user.id },
                    { receiver_id: req.user.id }
                ]
            },
            order: [['created_at', 'DESC']]
        });
        res.json(feedbacks);
    } catch (err) {
        console.error('getMyFeedback:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendFeedback = async (req, res) => {
    try {
        const { message, receiver_id, feedback_type_code } = req.body;
        const feedback = await Feedback.create({
            organization_id: req.user.organization_id,
            message,
            sender_id: req.user.id,
            receiver_id: receiver_id || req.user.id,
            feedback_type_code: feedback_type_code || 'GENERAL',
            status_code: 'PENDING'
        });
        res.json({ success: true, feedback });
    } catch (err) {
        console.error('sendFeedback:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// ASSIGNMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.createAssignment = async (req, res) => {
    try {
        const { title, description, group_id } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const assignment = await Assignment.create({
            organization_id: req.user.organization_id,
            group_id: group_id || 0,
            title: title || 'Assignment',
            description: description || null,
            file_url: fileUrl,
            status_code: 'ACTIVE',
            created_by: req.user.id
        });
        res.json({ success: true, assignment });
    } catch (err) {
        console.error('createAssignment:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAssignmentsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const assignments = await Assignment.findAll({
            where: { group_id: groupId, organization_id: req.user.organization_id }
        });
        res.json(assignments);
    } catch (err) {
        console.error('getAssignmentsByGroup:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// RESULT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getResultsByParticipant = async (req, res) => {
    try {
        const { participantId } = req.params;
        const results = await Result.findAll({
            where: { user_id: participantId, organization_id: req.user.organization_id },
            include: [{ model: Exam, attributes: ['title', 'exam_code'] }]
        });
        res.json(results);
    } catch (err) {
        console.error('getResultsByParticipant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMyResults = async (req, res) => {
    try {
        const results = await Result.findAll({
            where: { user_id: req.user.id, organization_id: req.user.organization_id },
            include: [{ model: Exam, attributes: ['title', 'exam_code'] }]
        });
        res.json(results);
    } catch (err) {
        console.error('getMyResults:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// ANSWER ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.submitAnswers = async (req, res) => {
    try {
        const { exam_id, answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Answers array required' });
        }
        for (const ans of answers) {
            let isCorrect = false;
            if (ans.selected_option_id) {
                const opt = await QuestionOption.findByPk(ans.selected_option_id);
                isCorrect = opt ? opt.is_correct : false;
            }
            await Answer.create({
                organization_id: req.user.organization_id,
                exam_id,
                question_id: ans.question_id,
                user_id: req.user.id,
                selected_option_id: ans.selected_option_id || null,
                answer_text: ans.answer_text || null,
                is_correct: isCorrect
            });
        }
        res.json({ message: 'Answers submitted' });
    } catch (err) {
        console.error('submitAnswers:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT ENDPOINTS (additional)
// ═══════════════════════════════════════════════════════════════

exports.getParticipants = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const participantRole = await Role.findOne({ where: { code: 'PARTICIPANT', organization_id: orgId } });
        if (!participantRole) return res.json([]);

        const userRoles = await UserRole.findAll({
            where: { role_id: participantRole.id, organization_id: orgId },
            include: [{ model: User, attributes: { exclude: ['password'] } }]
        });
        const participants = userRoles.filter(ur => ur.User).map(ur => ur.User.toJSON());
        res.json(participants);
    } catch (err) {
        console.error('getParticipants:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getParticipantsBatch = async (req, res) => {
    try {
        const { batchCode } = req.params;
        const users = await User.findAll({
            where: { upload_batch_code: batchCode, organization_id: req.user.organization_id },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (err) {
        console.error('getParticipantsBatch:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUploadBatches = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { organization_id: req.user.organization_id, upload_batch_code: { [Op.ne]: null } },
            attributes: ['upload_batch_code'],
            group: ['upload_batch_code']
        });
        res.json(users.map(u => u.upload_batch_code));
    } catch (err) {
        console.error('getUploadBatches:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!user) return res.status(404).json({ error: 'Participant not found' });
        const { full_name, email, mobile, status_code } = req.body;
        await user.update({
            full_name: full_name || user.full_name,
            email: email || user.email,
            mobile: mobile !== undefined ? mobile : user.mobile,
            status_code: status_code || user.status_code
        });
        res.json({ message: 'Participant updated', user });
    } catch (err) {
        console.error('updateParticipant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        await UserRole.destroy({ where: { user_id: id, organization_id: req.user.organization_id } });
        await User.destroy({ where: { id, organization_id: req.user.organization_id } });
        res.json({ message: 'Participant deleted' });
    } catch (err) {
        console.error('deleteParticipant:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRemovedParticipants = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const users = await User.findAll({
            where: { organization_id: orgId, status_code: 'REMOVED' },
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (err) {
        console.error('getRemovedParticipants:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { full_name, mobile, photo } = req.body;
        await user.update({
            full_name: full_name || user.full_name,
            mobile: mobile !== undefined ? mobile : user.mobile,
            photo: photo || user.photo
        });
        res.json({ message: 'Profile updated', user: { id: user.id, full_name: user.full_name, email: user.email, mobile: user.mobile } });
    } catch (err) {
        console.error('updateMyProfile:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
