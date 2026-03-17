const { sequelize, User, Role } = require('./models');

async function debugData() {
    try {
        const users = await User.findAll();
        console.log("Users found:", users.length);
        users.forEach(u => console.log(`- ID: ${u.id}, Email: ${u.email}, OrgID: ${u.organization_id}`));

        const roles = await Role.findAll();
        console.log("Roles found:", roles.length);
        roles.forEach(r => console.log(`- ID: ${r.id}, Code: ${r.code}, OrgID: ${r.organization_id}`));

        process.exit(0);
    } catch (error) {
        console.error("Error debugging data:", error);
        process.exit(1);
    }
}

debugData();
