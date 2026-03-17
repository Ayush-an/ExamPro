const { Organization, User, Exam, Subscription, Plan } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalOrganizations = await Organization.count();
        const activeOrganizations = await Organization.count({ where: { status_code: 'ACTIVE' } });
        const totalUsers = await User.count();
        const activeExams = await Exam.count({ where: { status_code: 'ACTIVE' } });

        // Fetch recent activities (latest 5 organizations)
        const recentActivities = await Organization.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{ model: Subscription, include: [Plan] }]
        });

        res.json({
            totalOrganizations,
            activeOrganizations,
            totalUsers,
            activeExams,
            recentActivities
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Subscription.findAll({
            include: [
                { model: Organization, attributes: ['name'] },
                { model: Plan, attributes: ['name', 'price', 'currency_code'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getOrganizations = async (req, res) => {
    try {
        const orgs = await Organization.findAll({
            include: [
                { model: Subscription, include: [Plan] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(orgs);
    } catch (error) {
        console.error("Error in getOrganizations:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const { name, plan_type_code, billing_cycle_code, price, currency_code, features, status_code, description } = req.body;
        const plan = await Plan.create({
            name, plan_type_code, billing_cycle_code, price, currency_code,
            features: features || null,
            description: description || null,
            status_code
        });
        res.json({ message: 'Plan created successfully', plan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const plans = await Plan.findAll();
        res.json(plans);
    } catch (error) {
        console.error("Error in getPlans:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, plan_type_code, billing_cycle_code, price, currency_code, features, status_code, description } = req.body;
        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        await plan.update({
            name, plan_type_code, billing_cycle_code, price, currency_code,
            features: features || plan.features,
            description: description || plan.description,
            status_code
        });
        res.json({ message: 'Plan updated successfully', plan });
    } catch (error) {
        console.error("Error in updatePlan:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        await plan.destroy();
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const { Role, UserRole } = require('../models');
        const adminRole = await Role.findOne({ where: { code: 'ADMIN' } });
        if (!adminRole) return res.json({ admins: [] });

        const userRoles = await UserRole.findAll({
            where: { role_id: adminRole.id },
            include: [{ model: User, attributes: ['id', 'full_name', 'email', 'organization_id', 'status_code'] }]
        });
        const admins = userRoles.filter(ur => ur.User).map(ur => ur.User.toJSON());
        res.json({ admins });
    } catch (error) {
        console.error('getAdmins error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getSuperadminStats = async (req, res) => {
    try {
        const { Role, UserRole } = require('../models');
        const adminRole = await Role.findOne({ where: { code: 'ADMIN' } });
        const totalAdmins = adminRole ? await UserRole.count({ where: { role_id: adminRole.id } }) : 0;
        const totalOrganizations = await Organization.count();
        res.json({ totalAdmins, totalOrganizations });
    } catch (error) {
        console.error('getSuperadminStats error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};
