const { Exam, ExamGroup, GroupMember, Notice, Group } = require('../models');

/**
 * GET /api/participant/exams
 * Returns all exams assigned to groups the authenticated participant belongs to.
 */
exports.getParticipantExams = async (req, res) => {
    try {
        const userId = req.user.id;
        const orgId = req.user.organization_id;

        // Find all groups this participant belongs to
        const groupMemberships = await GroupMember.findAll({
            where: { user_id: userId, organization_id: orgId },
            attributes: ['group_id'],
        });

        const groupIds = groupMemberships.map(gm => gm.group_id);

        if (groupIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Find all ExamGroups that link these groups to exams
        const examGroups = await ExamGroup.findAll({
            where: { group_id: groupIds, organization_id: orgId },
            include: [{ model: Exam }],
        });

        const exams = examGroups
            .filter(eg => eg.Exam)
            .map(eg => ({
                ...eg.Exam.toJSON(),
                isActive: eg.Exam.status_code === 'ACTIVE',
            }));

        res.json({ success: true, data: exams });
    } catch (err) {
        console.error('getParticipantExams error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/participant/notices
 * Returns notices sent to this participant directly or to their group.
 */
exports.getMyNotices = async (req, res) => {
    try {
        const userId = req.user.id;
        const orgId = req.user.organization_id;

        // Get their group memberships
        const groupMemberships = await GroupMember.findAll({
            where: { user_id: userId, organization_id: orgId },
            attributes: ['group_id'],
        });
        const groupIds = groupMemberships.map(gm => gm.group_id);

        const { Op } = require('sequelize');
        const notices = await Notice.findAll({
            where: {
                organization_id: orgId,
                [Op.or]: [
                    { receiver_id: userId },
                    { group_id: groupIds.length > 0 ? groupIds : null },
                    { target_type_code: 'ALL' },
                ],
            },
            order: [['created_at', 'DESC']],
        });

        res.json(notices);
    } catch (err) {
        console.error('getMyNotices error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
