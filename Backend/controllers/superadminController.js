const { Organization, User, Exam, Subscription, Plan, Question, Notice, Assignment, Role, UserRole, Coupon } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalOrganizations = await Organization.count();
        const activeOrganizations = await Organization.count({ where: { status_code: 'ACTIVE' } });
        
        // Global system-wide stats
        const totalAdmins = await UserRole.count({
            include: [{ model: Role, where: { code: 'ADMIN' } }]
        });
        const totalParticipants = await UserRole.count({
            include: [{ model: Role, where: { code: 'PARTICIPANT' } }]
        });
        const totalSuperUsers = await UserRole.count({
            include: [{ model: Role, where: { code: 'SUPERUSER' } }]
        });
        
        const totalQuestions = await Question.count();
        const totalNotices = await Notice.count();
        const totalAssignments = await Assignment.count();

        // Fetch recent activities (latest 5 organizations)
        const recentActivities = await Organization.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{ model: Subscription, include: [Plan] }]
        });

        res.json({
            totalOrganizations,
            activeOrganizations,
            totalAdmins,
            totalParticipants,
            totalSuperUsers,
            totalQuestions,
            totalNotices,
            totalAssignments,
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

exports.getOrganizationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const org = await Organization.findByPk(id, {
            include: [
                { model: Subscription, include: [Plan] }
            ]
        });

        if (!org) return res.status(404).json({ error: 'Organization not found' });

        // Fetch counts
        const userCount = await User.count({ where: { organization_id: id } });
        const examCount = await Exam.count({ where: { organization_id: id } });
        const questionCount = await Question.count({ where: { organization_id: id } });

        res.json({
            ...org.toJSON(),
            stats: {
                users: userCount,
                exams: examCount,
                questions: questionCount
            }
        });
    } catch (error) {
        console.error("Error in getOrganizationDetails:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.createPlan = async (req, res) => {
    try {
        const { name, plan_type_code, billing_cycle_code, price, currency_code, features, status_code, description, participant_limit, active_participant_limit, question_limit } = req.body;
        const plan = await Plan.create({
            name, 
            plan_type_code: plan_type_code || 'STANDARD', 
            billing_cycle_code, price, currency_code,
            features: features || null,
            description: description || null,
            status_code: status_code || 'ACTIVE',
            participant_limit: participant_limit != null ? parseInt(participant_limit) : null,
            active_participant_limit: active_participant_limit != null ? parseInt(active_participant_limit) : null,
            question_limit: question_limit != null ? parseInt(question_limit) : null,
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
        const { name, plan_type_code, billing_cycle_code, price, currency_code, features, status_code, description, participant_limit, active_participant_limit, question_limit } = req.body;
        const plan = await Plan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        await plan.update({
            name, 
            plan_type_code: plan_type_code || plan.plan_type_code, 
            billing_cycle_code, price, currency_code,
            features: features || plan.features,
            description: description || plan.description,
            status_code,
            participant_limit: participant_limit !== undefined ? (participant_limit != null ? parseInt(participant_limit) : null) : plan.participant_limit,
            active_participant_limit: active_participant_limit !== undefined ? (active_participant_limit != null ? parseInt(active_participant_limit) : null) : plan.active_participant_limit,
            question_limit: question_limit !== undefined ? (question_limit != null ? parseInt(question_limit) : null) : plan.question_limit,
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
        await plan.update({ status_code: 'INACTIVE' });
        res.json({ message: 'Plan architecture decommissioned (set to INACTIVE)' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const adminRole = await Role.findOne({ where: { code: 'ADMIN' } });
        if (!adminRole) return res.json({ admins: [] });

        const userRoles = await UserRole.findAll({
            where: { role_id: adminRole.id },
            include: [{ 
                model: User, 
                attributes: ['id', 'full_name', 'email', 'organization_id', 'status_code'],
                include: [{ model: Organization, attributes: ['name'] }]
            }]
        });
        const admins = userRoles.filter(ur => ur.User).map(ur => ({
            ...ur.User.toJSON(),
            organizationName: ur.User.Organization?.name || 'N/A'
        }));
        res.json({ admins });
    } catch (error) {
        console.error('getAdmins error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.getListByType = async (req, res) => {
    try {
        const { type } = req.params;
        let data = [];

        switch (type) {
            case 'participants': {
                const roles = await Role.findAll({ where: { code: 'PARTICIPANT' } });
                const roleIds = roles.map(r => r.id);
                if (roleIds.length) {
                    const userRoles = await UserRole.findAll({
                        where: { role_id: { [Op.in]: roleIds } },
                        include: [{ 
                            model: User, 
                            attributes: ['full_name', 'email', 'status_code'],
                            include: [{ model: Organization, attributes: ['name'] }]
                        }]
                    });
                    data = userRoles.map(ur => {
                        if (!ur.User) return null;
                        const user = ur.User.toJSON();
                        return {
                            ...user,
                            organizationName: user.Organization?.name || 'N/A'
                        };
                    }).filter(Boolean);
                }
                break;
            }
            case 'superusers': {
                const roles = await Role.findAll({ where: { code: 'SUPERUSER' } });
                const roleIds = roles.map(r => r.id);
                if (roleIds.length) {
                    const userRoles = await UserRole.findAll({
                        where: { role_id: { [Op.in]: roleIds } },
                        include: [{ 
                            model: User, 
                            attributes: ['full_name', 'email', 'status_code'],
                            include: [{ model: Organization, attributes: ['name'] }]
                        }]
                    });
                    data = userRoles.map(ur => {
                        if (!ur.User) return null;
                        const user = ur.User.toJSON();
                        return {
                            ...user,
                            organizationName: user.Organization?.name || 'N/A'
                        };
                    }).filter(Boolean);
                }
                break;
            }
            case 'questions':
                data = await Question.findAll({ 
                    attributes: ['id', ['title', 'name'], ['description', 'message']], 
                    include: [{ model: Organization, attributes: ['name'] }],
                    limit: 100 
                });
                break;
            case 'notices':
                data = await Notice.findAll({ 
                    attributes: ['id', 'title', 'message'], 
                    include: [{ model: Organization, attributes: ['name'] }],
                    limit: 100 
                });
                break;
            case 'assignments':
                data = await Assignment.findAll({ 
                    attributes: ['id', ['title', 'name'], ['description', 'message']], 
                    include: [{ model: Organization, attributes: ['name'] }],
                    limit: 100 
                });
                break;
            default:
                return res.status(400).json({ error: 'Invalid type' });
        }

        res.json(data);
    } catch (error) {
        console.error('getListByType error:', error);
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

// ─── Profile Management ───────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Organization, attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'state', 'country', 'zip_code'] }]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, email, mobile } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ error: 'Email already in use' });
        }

        await user.update({ full_name, email, mobile });
        res.json({ message: 'Profile updated successfully', user: { id: user.id, full_name, email, mobile } });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('updatePassword error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Multer storage for superadmin photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'upload/superadmin';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'superadmin-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
}).single('photo');

exports.uploadPhoto = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            // Delete old photo if exists
            if (user.photo) {
                const oldPath = path.join('upload/superadmin', user.photo);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            await user.update({ photo: req.file.filename });
            res.json({ 
                message: 'Photo uploaded successfully', 
                photo: req.file.filename 
            });
        } catch (error) {
            console.error('uploadPhoto error:', error);
            res.status(500).json({ error: 'Server Error' });
        }
    });
};

// ─── Coupon Management ──────────────────────────────────────────────────────

exports.createCoupon = async (req, res) => {
    try {
        const { coupon_code, discount_type, discount_value, description } = req.body;
        const coupon = await Coupon.create({
            coupon_code,
            discount_type,
            discount_value,
            description,
            status_code: 'ACTIVE'
        });
        res.json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
        console.error("Error in createCoupon:", error);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
};

exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            order: [['created_at', 'DESC']]
        });
        res.json(coupons);
    } catch (error) {
        console.error("Error in getCoupons:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, discount_type, discount_value, status_code } = req.body;
        const coupon = await Coupon.findByPk(id);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

        await coupon.update({
            description: description !== undefined ? description : coupon.description,
            discount_type: discount_type || coupon.discount_type,
            discount_value: discount_value !== undefined ? discount_value : coupon.discount_value,
            status_code: status_code || coupon.status_code
        });

        res.json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
        console.error("Error in updateCoupon:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);
        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

        await coupon.update({ status_code: 'INACTIVE' });
        res.json({ message: 'Coupon deactivated successfully' });
    } catch (error) {
        console.error("Error in deleteCoupon:", error);
        res.status(500).json({ error: 'Server Error' });
    }
};
