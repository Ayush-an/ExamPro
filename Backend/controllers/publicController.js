const { Organization, User, Role, UserRole, Subscription, Plan } = require('../models');
const bcrypt = require('bcrypt');

exports.registerOrganization = async (req, res) => {
    try {
        const {
            orgName, email, country, state, phone, address,
            adminName, adminEmail, adminPhone, password, planId
        } = req.body;

        // 1. Create Organization
        const organization = await Organization.create({
            name: orgName,
            email: email,
            phone: phone,
            address: address,
            country: country,
            state: state,
            type_code: 'CORPORATE', // Default or derived
            status_code: 'ACTIVE'
        });

        // 2. Create all required roles for the organization
        const roleDefs = [
            { name: 'Admin', code: 'ADMIN' },
            { name: 'Participant', code: 'PARTICIPANT' },
            { name: 'Super User', code: 'SUPERUSER' },
        ];
        const createdRoles = {};
        for (const rd of roleDefs) {
            const [r] = await Role.findOrCreate({
                where: { organization_id: organization.id, code: rd.code },
                defaults: { name: rd.name, status_code: 'ACTIVE' },
            });
            createdRoles[rd.code] = r;
        }
        const role = createdRoles['ADMIN'];

        // 3. Create Admin User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            organization_id: organization.id,
            full_name: adminName,
            email: adminEmail,
            mobile: adminPhone,
            password: hashedPassword,
            status_code: 'ACTIVE'
        });

        // 4. Assign Role
        await UserRole.create({
            organization_id: organization.id,
            user_id: user.id,
            role_id: role.id
        });

        // 5. Create Subscription
        // For a real app, date logic depends on plan length
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month default

        await Subscription.create({
            organization_id: organization.id,
            plan_id: planId,
            status_code: 'ACTIVE',
            payment_status_code: 'PAID',
            start_date: startDate,
            end_date: endDate
        });

        res.json({ message: 'Organization registered successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll({
            where: { status_code: 'ACTIVE' },
            order: [['price', 'ASC']]
        });
        res.json(plans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching plans.' });
    }
};
