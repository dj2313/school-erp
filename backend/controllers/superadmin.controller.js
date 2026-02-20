const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        // Get stats with parallel queries
        const [
            totalInstitutions,
            totalStudents,
            activeUsers,
            activeSubscriptions,
            recentInstitutions,
            monthlyGrowth,
        ] = await Promise.all([
            // Total institutions
            prisma.institution.count(),

            // Total students across all institutions
            prisma.student.count(),

            // Active users (last 24 hours)
            prisma.user.count({
                where: {
                    is_active: true,
                    last_login: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),

            // Subscriptions distribution
            prisma.institution.groupBy({
                by: ['subscription'],
                _count: true,
            }),

            // Recent institutions (last 10)
            prisma.institution.findMany({
                take: 10,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    subscription: true,
                    is_active: true,
                    created_at: true,
                    _count: { select: { users: true, students: true } },
                },
            }),

            // Monthly growth (last 6 months)
            prisma.$queryRaw`
                SELECT 
                    DATE_TRUNC('month', created_at) as month,
                    COUNT(*) as count
                FROM "Institution"
                WHERE created_at >= NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', created_at)
                ORDER BY month
            `.catch(() => []),
        ]);

        // Calculate revenue (assuming ₹5000 for basic, ₹15000 for pro, ₹50000 for enterprise)
        const subscriptionMap = { basic: 5000, pro: 15000, enterprise: 50000 };
        const revenue = activeSubscriptions.reduce((sum, sub) => {
            return sum + (subscriptionMap[sub.subscription] || 0) * (sub._count || 0);
        }, 0);

        res.json({
            stats: {
                totalInstitutions,
                totalStudents,
                activeUsers,
                revenue,
            },
            subscriptions: activeSubscriptions,
            recentInstitutions,
            monthlyGrowth: monthlyGrowth.map(item => ({
                month: item.month,
                count: item.count,
            })),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
