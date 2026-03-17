const bcrypt = require('bcrypt');
const {
    sequelize,
    Organization, User, Role, UserRole,
    Dataset, DatasetValue, Plan, PlanLimit
} = require('../models');

async function seedMasterData() {
    // const transaction = await sequelize.transaction();
    const transaction = null; // Disable transaction for debugging
    try {
        console.log('--- Starting Master Data Seeding ---');

        // 1. Create System Organization
        console.log('Creating System Organization...');
        const [org] = await Organization.findOrCreate({
            where: { name: 'NewExamPro System' },
            defaults: {
                type_code: 'SYSTEM',
                status_code: 'ACTIVE',
                email: 'admin@newexampro.com'
            },
            transaction
        });
        console.log('Org ID:', org.id);

        // 2. Create System Datasets
        const datasets = [
            { name: 'Organization Status', code: 'ORG_STATUS', description: 'Status of organizations' },
            { name: 'User Status', code: 'USER_STATUS', description: 'Status of users' },
            { name: 'Role Status', code: 'ROLE_STATUS', description: 'Status of roles' },
            { name: 'Group Status', code: 'GROUP_STATUS', description: 'Status of groups' },
            { name: 'Exam Status', code: 'EXAM_STATUS', description: 'Status of exams' },
            { name: 'Subscription Status', code: 'SUBSCRIPTION_STATUS', description: 'Status of subscriptions' },
            { name: 'Plan Type', code: 'PLAN_TYPE', description: 'Types of subscription plans' },
        ];

        for (const ds of datasets) {
            console.log(`Creating dataset: ${ds.code}...`);
            const [dataset] = await Dataset.findOrCreate({
                where: { organization_id: org.id, code: ds.code },
                defaults: { ...ds, status_code: 'ACTIVE', is_system: true },
                transaction
            });
            console.log(`Dataset ID for ${ds.code}:`, dataset.id);

            // Seed Values for each dataset
            const values = [];
            if (ds.code === 'ORG_STATUS' || ds.code === 'USER_STATUS' || ds.code === 'ROLE_STATUS' || ds.code === 'GROUP_STATUS' || ds.code === 'EXAM_STATUS' || ds.code === 'SUBSCRIPTION_STATUS') {
                values.push(
                    { value_code: 'ACTIVE', value_label: 'Active' },
                    { value_code: 'INACTIVE', value_label: 'Inactive' },
                    { value_code: 'PENDING', value_label: 'Pending' }
                );
            } else if (ds.code === 'PLAN_TYPE') {
                values.push(
                    { value_code: 'EXAM', value_label: 'Exam Only' },
                    { value_code: 'LMS', value_label: 'LMS Only' },
                    { value_code: 'SURVEY', value_label: 'Survey Only' },
                    { value_code: 'BUNDLE', value_label: 'Full Bundle' }
                );
            }

            for (const v of values) {
                await DatasetValue.findOrCreate({
                    where: { organization_id: org.id, dataset_id: dataset.id, value_code: v.value_code },
                    defaults: { ...v, status_code: 'ACTIVE' },
                    transaction
                });
            }
        }

        // 3. Create Default Roles
        const roleCodes = ['SUPERADMIN', 'ADMIN', 'SUPERUSER', 'PARTICIPANT'];
        const roles = {};
        for (const code of roleCodes) {
            const [role] = await Role.findOrCreate({
                where: { organization_id: org.id, code },
                defaults: {
                    name: code.charAt(0) + code.slice(1).toLowerCase().replace('_', ' '),
                    status_code: 'ACTIVE',
                    is_system: true
                },
                transaction
            });
            roles[code] = role;
        }

        // 4. Create SuperAdmin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const [user] = await User.findOrCreate({
            where: { email: 'superadmin@exampro.com' },
            defaults: {
                organization_id: org.id,
                full_name: 'Super Admin',
                password: hashedPassword,
                status_code: 'ACTIVE',
                approved: true
            },
            transaction
        });

        // 5. Assign SuperAdmin Role
        console.log(`Debug IDs: Org=${org.id}, User=${user.id}, Role=${roles['SUPERADMIN'] ? roles['SUPERADMIN'].id : 'NULL'}`);
        if (!roles['SUPERADMIN']) throw new Error('SUPERADMIN role not found in roles map');

        try {
            const [userRole, created] = await UserRole.findOrCreate({
                where: { organization_id: org.id, user_id: user.id, role_id: roles['SUPERADMIN'].id },
                defaults: { assigned_by: user.id }, // Just in case
                transaction
            });
            console.log(`UserRole ${created ? 'created' : 'found'}. RoleID: ${userRole.role_id}`);
        } catch (urError) {
            console.error('Error in UserRole assignment:', urError.name, urError.message);
            if (urError.errors) urError.errors.forEach(e => console.error(`- ${e.message}`));
            throw urError; // Still throw to stop
        }

        // 6. Create Initial Plans
        const plans = [
            { name: 'Basic Exam Plan', price: 99.00, plan_type_code: 'EXAM', description: 'Up to 100 participants' },
            { name: 'Pro Bundle', price: 299.00, plan_type_code: 'BUNDLE', description: 'Unlimited everything' }
        ];

        for (const p of plans) {
            const [plan] = await Plan.findOrCreate({
                where: { name: p.name },
                defaults: {
                    ...p,
                    billing_cycle_code: 'MONTHLY',
                    currency_code: 'USD',
                    status_code: 'ACTIVE'
                },
                transaction
            });

            // Add plan limits
            const limits = [
                { limit_key: 'USERS', limit_value: p.plan_type_code === 'BUNDLE' ? 999999 : 100 },
                { limit_key: 'EXAMS', limit_value: p.plan_type_code === 'BUNDLE' ? 999999 : 10 }
            ];

            for (const limit of limits) {
                await PlanLimit.findOrCreate({
                    where: { plan_id: plan.id, limit_key: limit.limit_key },
                    defaults: { limit_value: limit.limit_value },
                    transaction
                });
            }
        }

        if (transaction) await transaction.commit();
        console.log('--- Seeding Completed Successfully ---');
        console.log('SuperAdmin: superadmin@exampro.com / admin123');
        process.exit(0);

    } catch (error) {
        // if (transaction) await transaction.rollback();
        console.error('--- Seeding Failed ---');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.errors) {
            error.errors.forEach(err => {
                console.error(`- ${err.message} (${err.type}): ${err.path} = ${err.value}`);
            });
        }
        console.error('Full stack track:', error.stack);
        process.exit(1);
    }
}

seedMasterData();
