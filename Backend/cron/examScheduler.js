const cron = require('node-cron');
const { Exam } = require('../models');
const { Op } = require('sequelize');

/**
 * Exam Scheduler Cron Job
 * Runs every minute to:
 * 1. ACTIVATE scheduled exams whose start_date has arrived
 * 2. COMPLETE active exams whose end_date has passed
 */
function startExamScheduler() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();

        try {
            // 1. Activate SCHEDULED exams whose start_date <= now
            const activated = await Exam.update(
                { status_code: 'ACTIVE' },
                {
                    where: {
                        status_code: 'SCHEDULED',
                        start_date: { [Op.lte]: now },
                        removed_at: null
                    }
                }
            );
            if (activated[0] > 0) {
                console.log(`[CRON] Activated ${activated[0]} scheduled exam(s)`);
            }

            // 2. Complete ACTIVE exams whose end_date <= now
            const completed = await Exam.update(
                { status_code: 'COMPLETED' },
                {
                    where: {
                        status_code: 'ACTIVE',
                        end_date: { [Op.lte]: now, [Op.ne]: null },
                        removed_at: null
                    }
                }
            );
            if (completed[0] > 0) {
                console.log(`[CRON] Completed ${completed[0]} active exam(s)`);
            }
        } catch (err) {
            console.error('[CRON] Exam scheduler error:', err.message);
        }
    });

    console.log('[CRON] Exam scheduler started (runs every minute)');
}

module.exports = { startExamScheduler };
