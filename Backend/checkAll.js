const { Organization, User, Role, Plan, Subscription } = require('./models');

async function checkAll() {
    try {
        console.log("--- ORGANIZATIONS ---");
        const orgs = await Organization.findAll();
        orgs.forEach(o => console.log(`ID: ${o.id}, Name: ${o.name}, Status: ${o.status_code}`));

        console.log("\n--- USERS ---");
        const users = await User.findAll();
        users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}, OrgID: ${u.organization_id}`));

        console.log("\n--- ROLES ---");
        const roles = await Role.findAll();
        roles.forEach(r => console.log(`ID: ${r.id}, Code: ${r.code}, OrgID: ${r.organization_id}`));

        console.log("\n--- PLANS ---");
        const plans = await Plan.findAll();
        plans.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, Code: ${p.plan_type_code}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAll();
