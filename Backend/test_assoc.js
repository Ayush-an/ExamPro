const { User, Role, UserRole } = require('./models');

async function testAssociations() {
    try {
        console.log('Testing UserRole.findAll with User include...');
        const ur = await UserRole.findOne({ include: [User] });
        console.log('Success!', ur ? 'Found a record' : 'No records yet');
    } catch (e) {
        console.error('Association Test Failed:', e.message);
    } finally {
        process.exit();
    }
}

testAssociations();
