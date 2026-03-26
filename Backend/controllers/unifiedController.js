const {
    Exam, ExamGroup, ExamQuestion, Group, GroupMember, Question, QuestionOption,
    Notice, Feedback, Assignment, Result, Answer, ExamAttempt,
    User, Role, UserRole, StagingParticipant, Category, Topic
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
            include: [
                { model: Group, through: { attributes: [] } },
                { model: User, as: 'Creator', attributes: ['full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ exams });
    } catch (err) {
        console.error('getExams Error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.createExam = async (req, res) => {
    try {
        const { 
            title, description, duration_minutes, duration, groupIds, group_id, 
            start_date, end_date, scheduled, status, status_code,
            max_questions, max_marks, category_id, topic_id
        } = req.body;
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
            created_by: req.user.id,
            max_questions: parseInt(max_questions) || 0,
            max_marks: parseInt(max_marks) || 0,
            category_id: category_id || null,
            topic_id: topic_id || null
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

        const { 
            title, description, duration_minutes, duration, status, status_code, 
            start_date, end_date, groupIds, selectedGroups,
            max_questions, max_marks, category_id, topic_id
        } = req.body;

        // Build update object with only allowed fields
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (duration_minutes !== undefined || duration !== undefined) updateData.duration_minutes = duration_minutes || duration;
        if (status_code !== undefined || status !== undefined) updateData.status_code = status_code || status;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        if (max_questions !== undefined) updateData.max_questions = parseInt(max_questions) || 0;
        if (max_marks !== undefined) updateData.max_marks = parseInt(max_marks) || 0;
        if (category_id !== undefined) updateData.category_id = category_id;
        if (topic_id !== undefined) updateData.topic_id = topic_id;

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
            include: [
                { model: Group, through: { attributes: [] } },
                { model: User, as: 'Creator', attributes: ['full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(exams);
    } catch (err) {
        console.error('getRemovedExams Error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
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
            where: { organization_id: orgId, status_code: { [Op.ne]: 'REMOVED' } },
            include: [
                { model: GroupMember, attributes: ['id'] },
                { model: User, attributes: ['full_name'] }
            ],
            order: [['created_at', 'DESC']]
        });
        const mapped = groups.map(g => {
            const raw = g.toJSON();
            return {
                id: raw.id,
                name: raw.name,
                description: raw.description,
                status: raw.status_code,
                start: raw.start_date || '',
                end: raw.end_date || '',
                createdAt: raw.created_at,
                updatedAt: raw.updated_at,
                createdBy: raw.User ? raw.User.full_name : 'Unknown',
                participants: raw.GroupMembers ? raw.GroupMembers.length : 0,
            };
        });
        res.json(mapped);
    } catch (err) {
        console.error('getGroups Error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
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
        
        await group.update({ 
            status_code: 'REMOVED',
            removed_at: new Date(),
            removed_by: req.user.id
        });
        
        res.json({ message: 'Group removed' });
    } catch (err) {
        console.error('deleteGroup Error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getCategories = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        // Filter out REMOVED and only show active ones for the org (or system categories with orgId 1)
        const where = req.user.role === 'SUPERADMIN' 
            ? { status_code: { [Op.ne]: 'REMOVED' } } 
            : { organization_id: [orgId, 1], status_code: { [Op.ne]: 'REMOVED' } };
        
        const categories = await Category.findAll({
            where,
            order: [['created_at', 'DESC']]
        });
        res.json(categories);
    } catch (err) {
        console.error('getCategories:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const orgId = req.user.organization_id;

        // Prevent duplicates for the same organization
        const existing = await Category.findOne({
            where: { 
                name: name.trim(), 
                organization_id: orgId 
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Category with this name already exists' });
        }

        const category = await Category.create({
            organization_id: orgId,
            name: name.trim(),
            description: description || null,
        });
        res.json({ message: 'Category created', category });
    } catch (err) {
        console.error('createCategory:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, status_code } = req.body;
        const category = await Category.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        await category.update({
            name: name || category.name,
            description: description !== undefined ? description : category.description,
            status_code: status_code || category.status_code
        });
        res.json({ message: 'Category updated', category });
    } catch (err) {
        console.error('updateCategory:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        await category.update({ status_code: 'REMOVED' });
        res.json({ message: 'Category removed' });
    } catch (err) {
        console.error('deleteCategory:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRemovedCategories = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const categories = await Category.findAll({
            where: { organization_id: orgId, status_code: 'REMOVED' },
            order: [['updated_at', 'DESC']]
        });
        res.json(categories);
    } catch (err) {
        console.error('getRemovedCategories:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// ═══════════════════════════════════════════════════════════════
// TOPIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════

exports.getTopics = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const { category_id } = req.query;
        
        // Filter out REMOVED
        const where = req.user.role === 'SUPERADMIN' 
            ? { status_code: { [Op.ne]: 'REMOVED' } } 
            : { organization_id: [orgId, 1], status_code: { [Op.ne]: 'REMOVED' } };
            
        if (category_id) where.category_id = category_id;

        const topics = await Topic.findAll({
            where,
            include: [{ model: Category, attributes: ['name'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(topics);
    } catch (err) {
        console.error('getTopics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createTopic = async (req, res) => {
    try {
        const { category_id, name, description } = req.body;
        const orgId = req.user.organization_id;

        // Prevent duplicates in the same category for the same organization
        const existing = await Topic.findOne({
            where: { 
                name: name.trim(), 
                category_id,
                organization_id: orgId 
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Topic with this name already exists in this category' });
        }

        const topic = await Topic.create({
            organization_id: orgId,
            category_id,
            name: name.trim(),
            description: description || null,
        });
        res.json({ message: 'Topic created', topic });
    } catch (err) {
        console.error('createTopic:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_id, name, description, status_code } = req.body;
        const topic = await Topic.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!topic) return res.status(404).json({ error: 'Topic not found' });
        await topic.update({
            category_id: category_id || topic.category_id,
            name: name || topic.name,
            description: description !== undefined ? description : topic.description,
            status_code: status_code || topic.status_code
        });
        res.json({ message: 'Topic updated', topic });
    } catch (err) {
        console.error('updateTopic:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await Topic.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!topic) return res.status(404).json({ error: 'Topic not found' });
        await topic.update({ status_code: 'REMOVED' });
        res.json({ message: 'Topic removed' });
    } catch (err) {
        console.error('deleteTopic:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRemovedTopics = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const topics = await Topic.findAll({
            where: { organization_id: orgId, status_code: 'REMOVED' },
            include: [{ model: Category, attributes: ['name'] }],
            order: [['updated_at', 'DESC']]
        });
        res.json(topics);
    } catch (err) {
        console.error('getRemovedTopics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getRemovedGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            where: { organization_id: req.user.organization_id, status_code: 'REMOVED' },
            include: [
                { model: User, attributes: ['id', 'full_name'], required: false },
                { model: GroupMember, attributes: ['id'] }
            ],
            order: [['updated_at', 'DESC']]
        });
        const mapped = groups.map(g => {
            const raw = g.toJSON();
            return {
                id: raw.id,
                name: raw.name,
                description: raw.description,
                status: raw.status_code,
                createdAt: raw.created_at,
                updatedAt: raw.updated_at,
                createdBy: raw.User ? raw.User.full_name : null,
                participants: raw.GroupMembers ? raw.GroupMembers.length : 0,
            };
        });
        res.json(mapped);
    } catch (err) {
        console.error('getRemovedGroups Error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
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
        const exam = await Exam.findByPk(examId, {
            include: [{
                model: Question,
                include: [{ model: QuestionOption }],
                through: { attributes: ['marks', 'sort_order'] }
            }]
        });
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        
        // Map questions to include exam-specific marks from join table
        const questions = exam.Questions.map(q => {
            const raw = q.toJSON();
            return {
                ...raw,
                marks: raw.ExamQuestion.marks // Use exam-specific marks
            };
        });

        res.json(questions);
    } catch (err) {
        console.error('getQuestionsByExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getAvailableQuestions = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const { category_id, topic_id, excludeExamId } = req.query;
        
        const where = { organization_id: orgId };
        if (category_id) where.category_id = category_id;
        if (topic_id) where.topic_id = topic_id;

        const include = [{ model: QuestionOption }];
        
        if (excludeExamId) {
            // This logic might need refinement depending on if we want to show questions 
            // already in other exams or just not in THIS exam. 
            // Requirements say "One question can exist in multiple exams", 
            // so we probably just want to filter out questions ALREADY in excludeExamId.
            const assignedIds = (await ExamQuestion.findAll({
                where: { exam_id: excludeExamId, organization_id: orgId },
                attributes: ['question_id']
            })).map(eq => eq.question_id);
            
            where.id = { [Op.notIn]: assignedIds };
        }

        const questions = await Question.findAll({
            where,
            include,
            order: [['created_at', 'DESC']]
        });
        res.json(questions);
    } catch (err) {
        console.error('getAvailableQuestions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const questions = await Question.findAll({
            where: { organization_id: orgId },
            include: [
                { model: Category, attributes: ['id', 'name'] },
                { model: Topic, attributes: ['id', 'name'] },
                { model: QuestionOption }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(questions);
    } catch (err) {
        console.error('getQuestions:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const { category_id, topic_id, question_text, question_type_code, difficulty_code, marks, options } = req.body;
        const question = await Question.create({
            organization_id: req.user.organization_id,
            category_id,
            topic_id,
            question_text,
            question_type_code: question_type_code || 'MCQ',
            difficulty_code: difficulty_code || 'MEDIUM',
            marks: marks || 1,
            created_by: req.user.id
        });
        if (options && Array.isArray(options)) {
            for (let i = 0; i < options.length; i++) {
                if (options[i].text || options[i].option_text) {
                    await QuestionOption.create({
                        organization_id: req.user.organization_id,
                        question_id: question.id,
                        option_text: options[i].text || options[i].option_text,
                        is_correct: options[i].is_correct || false,
                        sort_order: i
                    });
                }
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
        if (!req.file) return res.status(400).json({ error: 'Please upload a file' });
        const orgId = req.user.organization_id;

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        let count = 0;

        for (const row of data) {
            // Find or create Category
            const catName = row.Category || row.category_name;
            if (!catName) continue; // Category is mandatory

            let [category] = await Category.findOrCreate({
                where: { name: String(catName).trim(), organization_id: orgId }
            });

            // Find or create Topic
            const topName = row.Topic || row.topic_name;
            if (!topName) continue; // Topic is mandatory

            let [topic] = await Topic.findOrCreate({
                where: { 
                    name: String(topName).trim(), 
                    category_id: category.id,
                    organization_id: orgId 
                }
            });

            // Prevent duplicate question text in same topic
            const existing = await Question.findOne({
                where: {
                    organization_id: orgId,
                    topic_id: topic.id,
                    question_text: String(row.Question || row.question_text).trim()
                }
            });
            if (existing) continue;

            const q = await Question.create({
                organization_id: orgId,
                category_id: category.id,
                topic_id: topic.id,
                question_text: String(row.Question || row.question_text || 'No text').trim(),
                question_type_code: row.Type || 'MCQ',
                difficulty_code: row.Difficulty || 'MEDIUM',
                marks: parseInt(row.Marks) || 1,
                created_by: req.user.id
            });

            // Create options A, B, C, D, E (flexible)
            const optionCols = ['A', 'B', 'C', 'D', 'E'];
            for (let i = 0; i < optionCols.length; i++) {
                const optText = row[optionCols[i]];
                if (optText !== undefined && optText !== null && String(optText).trim() !== '') {
                    await QuestionOption.create({
                        organization_id: orgId,
                        question_id: q.id,
                        option_text: String(optText).trim(),
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

exports.assignQuestionsToExam = async (req, res) => {
    try {
        const { examId, questionIds, marksMap } = req.body; // marksMap optional: { qId: marks }
        const orgId = req.user.organization_id;

        const exam = await Exam.findByPk(examId);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        // Calculate current totals
        const existingEntries = await ExamQuestion.findAll({ where: { exam_id: examId, organization_id: orgId } });
        let currentCount = existingEntries.length;
        let currentMarks = existingEntries.reduce((sum, entry) => sum + entry.marks, 0);

        const newlyAdded = [];
        for (const qId of questionIds) {
            // Check if already assigned
            const exists = await ExamQuestion.findOne({ where: { exam_id: examId, question_id: qId, organization_id: orgId } });
            if (exists) continue;

            const question = await Question.findByPk(qId);
            if (!question) continue;

            const qMarks = (marksMap && marksMap[qId]) ? parseInt(marksMap[qId]) : question.marks;

            // Validation against limits
            if (exam.max_questions > 0 && currentCount + 1 > exam.max_questions) {
                return res.status(400).json({ error: `Exceeds max questions limit (${exam.max_questions})`, count: currentCount });
            }
            if (exam.max_marks > 0 && currentMarks + qMarks > exam.max_marks) {
                return res.status(400).json({ error: `Exceeds max marks limit (${exam.max_marks})`, currentMarks });
            }

            await ExamQuestion.create({
                organization_id: orgId,
                exam_id: examId,
                question_id: qId,
                marks: qMarks,
                sort_order: currentCount
            });

            currentCount++;
            currentMarks += qMarks;
            newlyAdded.push(qId);
        }

        res.json({ message: 'Questions assigned', added: newlyAdded.length, currentCount, currentMarks });
    } catch (err) {
        console.error('assignQuestionsToExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.unassignQuestionFromExam = async (req, res) => {
    try {
        const { examId, questionId } = req.body;
        await ExamQuestion.destroy({ 
            where: { 
                exam_id: examId, 
                question_id: questionId, 
                organization_id: req.user.organization_id 
            } 
        });
        res.json({ message: 'Question unassigned' });
    } catch (err) {
        console.error('unassignQuestionFromExam:', err);
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
            include: [{
                model: User,
                attributes: { exclude: ['password'] },
                where: { status_code: { [Op.ne]: 'REMOVED' } }, // Filter out removed ones
                include: [{
                    model: GroupMember,
                    include: [{ model: Group, attributes: ['id', 'name'] }],
                    required: false
                }]
            }]
        });
        const participants = userRoles.filter(ur => ur.User).map(ur => {
            const u = ur.User.toJSON();
            const firstGroup = u.GroupMembers && u.GroupMembers.length > 0 ? u.GroupMembers[0] : null;
            return {
                id: u.id,
                name: u.full_name,
                email: u.email,
                mobile: u.mobile,
                status: u.status_code,
                groupId: firstGroup ? firstGroup.group_id : null,
                groupName: firstGroup && firstGroup.Group ? firstGroup.Group.name : null,
                uploadBatchCode: u.upload_batch_code || null,
                createdAt: u.created_at,
                approved: u.approved,
            };
        });
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
            where: { 
                upload_batch_code: batchCode, 
                organization_id: req.user.organization_id,
                status_code: { [Op.ne]: 'REMOVED' }
            },
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
        const user = await User.findOne({
            where: { id, organization_id: req.user.organization_id }
        });
        if (!user) return res.status(404).json({ error: 'Participant not found' });
        
        // Soft delete: Change status to REMOVED, track removal info
        await user.update({ 
            status_code: 'REMOVED',
            removed_at: new Date(),
            removed_by: req.user.id
        });
        
        res.json({ message: 'Participant removed' });
    } catch (err) {
        console.error('deleteParticipant:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

exports.getRemovedParticipants = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const users = await User.findAll({
            where: { organization_id: orgId, status_code: 'REMOVED' },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: GroupMember,
                    include: [{ model: Group, attributes: ['id', 'name'] }],
                    required: false
                },
                {
                    model: User,
                    as: 'Remover',
                    attributes: ['full_name'],
                    required: false
                }
            ],
            order: [['removed_at', 'DESC']]
        });
        const mapped = users.map(u => {
            const raw = u.toJSON();
            const groupMember = raw.GroupMembers && raw.GroupMembers[0];
            const group = groupMember ? groupMember.Group : null;

            return {
                id: raw.id,
                name: raw.full_name,
                email: raw.email,
                mobile: raw.mobile,
                status: raw.status_code,
                dateOfJoin: raw.created_at,
                createdAt: raw.created_at,
                removedAt: raw.removed_at,
                removedByName: raw.Remover ? raw.Remover.full_name : 'Unknown',
                groupName: group ? (group.name) : '-'
            };
        });
        res.json({ success: true, data: mapped });
    } catch (err) {
        console.error('getRemovedParticipants Error:', err);
        res.status(500).json({ success: false, error: 'Server error', details: err.message });
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
