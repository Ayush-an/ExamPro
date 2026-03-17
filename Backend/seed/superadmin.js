const bcrypt = require('bcrypt');
const { Organization, User, Role, UserRole } = require('../models');

async function seedSuperAdmin() {
    try {
        const org = await Organization.create({
            name: 'System Default',
            type_code: 'SYSTEM',
            status_code: 'ACTIVE',
            email: 'system@exampro.com'
        });

        const role = await Role.create({
            organization_id: org.id,
            name: 'Super Admin',
            code: 'SUPERADMIN',
            status_code: 'ACTIVE'
        });

        const hashedPassword = await bcrypt.hash('123456', 10);

        const user = await User.create({
            organization_id: org.id,
            full_name: 'System SuperAdmin',
            email: 'superadmin@exampro.com',
            password: hashedPassword,
            status_code: 'ACTIVE'
        });

        await UserRole.create({
            organization_id: org.id,
            user_id: user.id,
            role_id: role.id
        });

        console.log('Super Admin seeded successfully. Login: superadmin@exampro.com / 123456');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding Super Admin:', error);
        process.exit(1);
    }
}

seedSuperAdmin();
