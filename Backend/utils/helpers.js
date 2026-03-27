const crypto = require('crypto');

exports.generateRandomPassword = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

exports.generateExamCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.generateBatchCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a file code in XX#### format:
 *   - 2 random uppercase A-Z letters
 *   - 4 random digits (0000–9999)
 * e.g. "AB1234"
 */
exports.generateFileCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const l1 = letters[Math.floor(Math.random() * 26)];
    const l2 = letters[Math.floor(Math.random() * 26)];
    const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `${l1}${l2}${digits}`;
};

/**
 * Shared helper to log actions to the History table
 */
exports.logHistory = async (orgId, entityType, entityId, entityName, action, opts = {}) => {
    try {
        const { History } = require('../models');
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
};
