const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const tables = ['users', 'groups', 'exams', 'questions'];
        for (const table of tables) {
            console.log(`\n--- Schema for table: ${table} ---`);
            const [results] = await sequelize.query(`DESCRIBE \`${table}\``);
            results.forEach(r => {
                console.log(`${r.Field.padEnd(20)} | ${r.Type.padEnd(15)} | ${r.Null.padEnd(5)} | ${r.Key.padEnd(5)}`);
            });
        }
    } catch (error) {
        console.error('Error checking schema:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
