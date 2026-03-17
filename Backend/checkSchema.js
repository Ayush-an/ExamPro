const { sequelize } = require('./models');

async function listTables() {
    try {
        const [tables] = await sequelize.query("SHOW TABLES");
        console.log("Tables in DB:", JSON.stringify(tables, null, 2));

        const [userRoleCols] = await sequelize.query("SHOW COLUMNS FROM user_roles");
        console.log("user_roles columns:", JSON.stringify(userRoleCols, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error listing tables/columns:", error);
        process.exit(1);
    }
}

listTables();
