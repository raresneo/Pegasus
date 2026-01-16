const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { asyncHandler } = require('../middleware/validation');

// GET /api/reports/dashboard - Date pentru dashboard principal
router.get('/dashboard', auth.verifyToken, asyncHandler(async (req, res) => {
    const [members, payments, bookings, tasks] = await Promise.all([
        db.read('members'),
        db.read('payments'),
        db.read('bookings'),
        db.read('tasks')
    ]);

    const now = new Date();
    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));

    // Statistici membri
    const activeMembers = members.filter(m => m.membership?.status === 'active').length;
    const expiredMembers = members.filter(m => m.membership?.status === 'expired').length;

    // Statistici financiare
    const monthlyPayments = payments.filter(p => new Date(p.date) >= monthAgo);
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Statistici programări
    const upcomingBookings = bookings.filter(b =>
        new Date(b.startTime) > new Date() && b.status !== 'cancelled'
    ).length;

    // Statistici task-uri
    const pendingTasks = tasks.filter(t => t.status !== 'done' && !t.isArchived).length;
    const highPriorityTasks = tasks.filter(t =>
        t.priority === 'high' && t.status !== 'done' && !t.isArchived
    ).length;

    res.json({
        success: true,
        data: {
            members: {
                total: members.length,
                active: activeMembers,
                expired: expiredMembers
            },
            revenue: {
                monthly: monthlyRevenue,
                payments: monthlyPayments.length
            },
            bookings: {
                upcoming: upcomingBookings
            },
            tasks: {
                pending: pendingTasks,
                highPriority: highPriorityTasks
            }
        }
    });
}));

// GET /api/reports/revenue - Raport venituri detaliat
router.get('/revenue', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;

    const payments = await db.read('payments');
    const now = new Date();

    let startDate;
    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        default:
            startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const periodPayments = payments.filter(p => new Date(p.date) >= startDate);
    const totalRevenue = periodPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Venituri pe zi
    const dailyRevenue = periodPayments.reduce((acc, p) => {
        const date = new Date(p.date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + p.amount;
        return acc;
    }, {});

    res.json({
        success: true,
        data: {
            period,
            totalRevenue,
            paymentsCount: periodPayments.length,
            averagePayment: periodPayments.length > 0 ? totalRevenue / periodPayments.length : 0,
            dailyBreakdown: dailyRevenue
        }
    });
}));

// GET /api/reports/members-stats - Statistici membri
router.get('/members-stats', auth.verifyToken, asyncHandler(async (req, res) => {
    const members = await db.read('members');

    // Breakdown după status
    const byStatus = members.reduce((acc, m) => {
        const status = m.membership?.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    // Breakdown după locație
    const byLocation = members.reduce((acc, m) => {
        const location = m.locationId || 'unknown';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
    }, {});

    // Membrii noi în ultima lună
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newMembers = members.filter(m => new Date(m.joinDate) >= monthAgo).length;

    res.json({
        success: true,
        data: {
            total: members.length,
            byStatus,
            byLocation,
            newMembersThisMonth: newMembers
        }
    });
}));

// GET /api/reports/attendance - Raport prezență
router.get('/attendance', auth.verifyToken, asyncHandler(async (req, res) => {
    const { period = 'week' } = req.query;

    const accessLogs = await db.read('accessLogs');
    const now = new Date();

    let startDate;
    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
        default:
            startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const periodLogs = accessLogs.filter(log =>
        new Date(log.timestamp) >= startDate && log.type === 'check_in'
    );

    // Check-in-uri pe zi
    const dailyCheckIns = periodLogs.reduce((acc, log) => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Check-in-uri pe membru (top 10)
    const byMember = periodLogs.reduce((acc, log) => {
        acc[log.memberId] = (acc[log.memberId] || 0) + 1;
        return acc;
    }, {});

    const topMembers = Object.entries(byMember)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([memberId, count]) => ({ memberId, checkInCount: count }));

    res.json({
        success: true,
        data: {
            period,
            totalCheckIns: periodLogs.length,
            dailyBreakdown: dailyCheckIns,
            topMembers
        }
    });
}));

module.exports = router;
