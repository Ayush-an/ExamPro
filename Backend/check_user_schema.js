const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query('DESCRIBE users');
        console.log('User Table Schema:');
        results.forEach(r => console.log(`${r.Field}: ${r.Type}`));

        const [gResults] = await sequelize.query('DESCRIBE `groups`');
        console.log('\nGroup Table Schema:');
        gResults.forEach(r => console.log(`${r.Field}: ${r.Type}`));

        const [qResults] = await sequelize.query('DESCRIBE `questions`');
        console.log('\nQuestion Table Schema:');
        qResults.forEach(r => console.log(`${r.Field}: ${r.Type}`));

        const [eResults] = await sequelize.query('DESCRIBE `exams`');
        console.log('\nExam Table Schema:');
        eResults.forEach(r => console.log(`${r.Field}: ${r.Type}`));
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
