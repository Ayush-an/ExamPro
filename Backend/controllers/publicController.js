const { Organization, User, Role, UserRole, Subscription, Plan, Coupon } = require('../models');
const bcrypt = require('bcrypt');

exports.registerOrganization = async (req, res) => {
    try {
        const {
            orgName, email, country, state, phone, address,
            adminName, adminEmail, adminPhone, password, planId, coupon_code
        } = req.body;

        // Verify coupon if provided
        let couponDiscount = 0;
        let appliedCouponCode = null;
        if (coupon_code) {
            const coupon = await Coupon.findOne({ where: { coupon_code: coupon_code.toUpperCase(), status_code: 'ACTIVE' } });
            if (!coupon) {
                return res.status(400).json({ error: 'Invalid or expired coupon code.' });
            }
            const plan = await Plan.findByPk(planId);
            if (!plan) {
                return res.status(400).json({ error: 'Invalid plan selected.' });
            }
            if (coupon.discount_type === 'PERCENTAGE') {
                couponDiscount = parseFloat((parseFloat(plan.price) * parseFloat(coupon.discount_value) / 100).toFixed(2));
            } else {
                couponDiscount = parseFloat(coupon.discount_value);
            }
            appliedCouponCode = coupon.coupon_code;
        }

        // 1. Create Organization
        const organization = await Organization.create({
            name: orgName,
            email: email,
            phone: phone,
            address: address,
            country: country,
            state: state,
            type_code: 'CORPORATE',
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
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await Subscription.create({
            organization_id: organization.id,
            plan_id: planId,
            status_code: 'ACTIVE',
            payment_status_code: 'PAID',
            start_date: startDate,
            end_date: endDate,
            coupon_code: appliedCouponCode,
            discount_amount: couponDiscount > 0 ? couponDiscount : null,
        });

        res.json({ message: 'Organization registered successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

// ─── Verify Coupon ────────────────────────────────────────────────────────────
exports.verifyCoupon = async (req, res) => {
    try {
        const { coupon_code, plan_id } = req.body;
        if (!coupon_code) return res.status(400).json({ error: 'Coupon code is required' });

        const coupon = await Coupon.findOne({
            where: { coupon_code: coupon_code.toUpperCase(), status_code: 'ACTIVE' }
        });
        if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon code' });

        let discount_amount = null;
        if (plan_id) {
            const plan = await Plan.findByPk(plan_id);
            if (plan) {
                if (coupon.discount_type === 'PERCENTAGE') {
                    discount_amount = parseFloat((parseFloat(plan.price) * parseFloat(coupon.discount_value) / 100).toFixed(2));
                } else {
                    discount_amount = parseFloat(coupon.discount_value);
                }
            }
        }

        res.json({
            valid: true,
            coupon_code: coupon.coupon_code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            discount_amount,
            description: coupon.description,
        });
    } catch (error) {
        console.error('verifyCoupon error:', error);
        res.status(500).json({ error: 'Server error verifying coupon.' });
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
