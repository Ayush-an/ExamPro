const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const tables = ['questions', 'exams', 'users', 'groups', 'participants'];
        for (const table of tables) {
            try {
                const [cols] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\``);
                console.log(`\nColumns for ${table}:`);
                cols.forEach(col => console.log(` - ${col.Field} (${col.Type})`));
            } catch (e) {
                console.log(`\nError checking ${table}: ${e.message}`);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
}

checkSchema();
