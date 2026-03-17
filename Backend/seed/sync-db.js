const { sequelize } = require('../models');

async function syncDb() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully. Staging tables created if missing.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

syncDb();
