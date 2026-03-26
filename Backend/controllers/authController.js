const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole, Organization } = require('../models');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

        // Fetch user roles
        const userRoles = await UserRole.findAll({ where: { user_id: user.id } });
        const roleIds = userRoles.map(ur => ur.role_id);
        const roles = await Role.findAll({ where: { id: roleIds } });
        const roleCodes = roles.map(r => r.code);

        // Pick primary role for token (simplify for now)
        const primaryRole = roleCodes.includes('SUPERADMIN') ? 'SUPERADMIN' :
            roleCodes.includes('ADMIN') ? 'ADMIN' :
                roleCodes.includes('SUPERUSER') ? 'SUPERUSER' : 'PARTICIPANT';

        const token = jwt.sign(
            { id: user.id, organization_id: user.organization_id, role: primaryRole },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Fetch full user with organization
        const fullUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Organization, attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'state', 'country', 'zip_code'] }]
        });

        res.json({
            message: 'Login successful',
            token,
            user: { ...fullUser.toJSON(), role: primaryRole }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Organization, attributes: ['id', 'name', 'type_code', 'status_code', 'email', 'phone', 'address', 'city', 'state', 'country', 'zip_code'] }]
        });
        res.json({ user, role: req.user.role });
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
