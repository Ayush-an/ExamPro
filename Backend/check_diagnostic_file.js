const { sequelize } = require('./models');
const fs = require('fs');

async function checkSchema() {
    let output = '';
    try {
        const tables = ['questions', 'exams', 'users', 'groups', 'participants'];
        for (const table of tables) {
            try {
                const [cols] = await sequelize.query(`SHOW COLUMNS FROM \`${table}\``);
                output += `\nColumns for ${table}:\n`;
                cols.forEach(col => {
                    output += ` - ${col.Field} (${col.Type})\n`;
                });
            } catch (e) {
                output += `\nError checking ${table}: ${e.message}\n`;
            }
        }
    } catch (error) {
        output += `Fatal error: ${error.message}\n`;
    }
    fs.writeFileSync('schema_status.txt', output);
    process.exit(0);
}

checkSchema();
