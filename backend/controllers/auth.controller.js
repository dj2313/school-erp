const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateTokens = (userId, role) => {
    const accessToken = jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (!user.is_active) return res.status(403).json({ message: 'Account is disabled' });

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);

        // Save refresh token in DB
        await prisma.user.update({
            where: { id: user.id },
            data: {
                refresh_token: refreshToken,
                last_login: new Date()
            }
        });

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                institution_id: user.institution_id
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await prisma.user.findFirst({
            where: { id: decoded.userId, refresh_token: token }
        });

        if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

        const { accessToken, refreshToken } = generateTokens(user.id, user.role);

        await prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: refreshToken }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

exports.logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            await prisma.user.update({
                where: { id: decoded.userId },
                data: { refresh_token: null }
            });
        } catch (err) {
            // Token might be expired, just clear cookie
        }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
    res.json({ user: req.user });
};
