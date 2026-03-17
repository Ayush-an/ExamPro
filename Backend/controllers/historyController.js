const { History } = require('../models');

/**
 * GET /api/admin/history/participants
 * Returns all history records with entity_type = PARTICIPANT for the org
 */
exports.getParticipantHistory = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const { action, from, to, file_code, limit = 200, offset = 0 } = req.query;
        const { Op } = require('sequelize');

        const where = { organization_id: orgId, entity_type: 'PARTICIPANT' };
        if (action) where.action = action;
        if (file_code) where.file_code = file_code;
        if (from || to) {
            where.changed_at = {};
            if (from) where.changed_at[Op.gte] = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                where.changed_at[Op.lte] = toDate;
            }
        }

        const rows = await History.findAll({
            where,
            order: [['changed_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const total = await History.count({ where });

        res.json({ success: true, total, data: rows });
    } catch (err) {
        console.error('getParticipantHistory error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * GET /api/admin/history/questions
 * Returns all history records with entity_type = QUESTION for the org
 */
exports.getQuestionHistory = async (req, res) => {
    try {
        const orgId = req.user.organization_id;
        const { action, from, to, file_code, limit = 200, offset = 0 } = req.query;
        const { Op } = require('sequelize');

        const where = { organization_id: orgId, entity_type: 'QUESTION' };
        if (action) where.action = action;
        if (file_code) where.file_code = file_code;
        if (from || to) {
            where.changed_at = {};
            if (from) where.changed_at[Op.gte] = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                where.changed_at[Op.lte] = toDate;
            }
        }

        const rows = await History.findAll({
            where,
            order: [['changed_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const total = await History.count({ where });

        res.json({ success: true, total, data: rows });
    } catch (err) {
        console.error('getQuestionHistory error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
