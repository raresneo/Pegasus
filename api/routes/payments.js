const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { validatePaymentData, asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/payments - Istoric plăți (cu filtrare)
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { memberId, method, startDate, endDate, page = 1, limit = 100 } = req.query;

    let payments = await db.read('payments');

    // Filtrare după membru
    if (memberId) {
        payments = payments.filter(p => p.memberId === memberId);
    }

    // Filtrare după metodă plată
    if (method) {
        payments = payments.filter(p => p.method?.toLowerCase() === method.toLowerCase());
    }

    // Filtrare după interval dată
    if (startDate) {
        const start = new Date(startDate);
        payments = payments.filter(p => new Date(p.date) >= start);
    }

    if (endDate) {
        const end = new Date(endDate);
        payments = payments.filter(p => new Date(p.date) <= end);
    }

    // Sortare după dată (cele mai recente primele)
    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginare
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = payments.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            payments: paginatedPayments,
            total: payments.length,
            page: parseInt(page),
            totalPages: Math.ceil(payments.length / parseInt(limit))
        }
    });
}));

// GET /api/payments/member/:memberId - Plăți pentru membru specific
router.get('/member/:memberId', auth.verifyToken, asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.memberId);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    const allPayments = await db.read('payments');
    const memberPayments = allPayments
        .filter(p => p.memberId === req.params.memberId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculează totaluri
    const totalPaid = memberPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paymentsByMethod = memberPayments.reduce((acc, p) => {
        const method = p.method || 'other';
        acc[method] = (acc[method] || 0) + p.amount;
        return acc;
    }, {});

    res.json({
        success: true,
        data: {
            member: {
                id: member.id,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email
            },
            payments: memberPayments,
            statistics: {
                totalPaid,
                paymentCount: memberPayments.length,
                paymentsByMethod
            }
        }
    });
}));

// POST /api/payments - Înregistrare plată nouă
router.post('/', auth.verifyToken, auth.authorize(['admin', 'trainer']), validatePaymentData, asyncHandler(async (req, res) => {
    const { memberId, amount, method, description, category } = req.body;

    // Verificare membru există
    const member = await db.get('members', memberId);
    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    const newPayment = await db.add('payments', {
        memberId,
        amount: parseFloat(amount),
        method: method.toLowerCase(),
        description: description || `Plată ${member.firstName} ${member.lastName}`,
        category: category || 'membership',
        date: new Date().toISOString(),
        status: 'succeeded'
    });

    res.status(201).json({
        success: true,
        data: newPayment,
        message: 'Plată înregistrată cu succes'
    });
}));

// GET /api/payments/stats - Statistici financiare
router.get('/stats', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const { period = 'month', startDate, endDate } = req.query;

    let payments = await db.read('payments');
    const now = new Date();

    // Filtrare după perioadă prestabilită sau interval custom
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        payments = payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate >= start && paymentDate <= end;
        });
    } else {
        // Perioade prestabilite
        let filterDate;
        switch (period) {
            case 'today':
                filterDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                filterDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                filterDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                filterDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                filterDate = new Date(now.setMonth(now.getMonth() - 1));
        }

        payments = payments.filter(p => new Date(p.date) >= filterDate);
    }

    // Calcule statistici
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paymentCount = payments.length;
    const averagePayment = paymentCount > 0 ? totalRevenue / paymentCount : 0;

    // Breakdown după metodă plată
    const revenueByMethod = payments.reduce((acc, p) => {
        const method = p.method || 'other';
        acc[method] = (acc[method] || 0) + p.amount;
        return acc;
    }, {});

    // Breakdown după categorie
    const revenueByCategory = payments.reduce((acc, p) => {
        const category = p.category || 'other';
        acc[category] = (acc[category] || 0) + p.amount;
        return acc;
    }, {});

    // Plăți pe zi (pentru grafice)
    const dailyRevenue = payments.reduce((acc, p) => {
        const dateKey = new Date(p.date).toISOString().split('T')[0];
        acc[dateKey] = (acc[dateKey] || 0) + p.amount;
        return acc;
    }, {});

    // Top 10 plătitori
    const paymentsByMember = payments.reduce((acc, p) => {
        acc[p.memberId] = (acc[p.memberId] || 0) + p.amount;
        return acc;
    }, {});

    const topPayers = Object.entries(paymentsByMember)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([memberId, amount]) => ({ memberId, amount }));

    res.json({
        success: true,
        data: {
            period,
            summary: {
                totalRevenue,
                paymentCount,
                averagePayment: Math.round(averagePayment * 100) / 100
            },
            breakdown: {
                byMethod: revenueByMethod,
                byCategory: revenueByCategory
            },
            dailyRevenue,
            topPayers
        }
    });
}));

// PUT /api/payments/:id - Actualizare plată (rare, dar util pentru corecții)
router.put('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    const payment = await db.get('payments', req.params.id);

    if (!payment) {
        throw new ApiError('Plată negăsită', 404, 'PAYMENT_NOT_FOUND');
    }

    const { amount, method, description, status } = req.body;

    const updatedPayment = await db.update('payments', req.params.id, {
        amount: amount !== undefined ? parseFloat(amount) : payment.amount,
        method: method || payment.method,
        description: description !== undefined ? description : payment.description,
        status: status || payment.status
    });

    res.json({
        success: true,
        data: updatedPayment,
        message: 'Plată actualizată cu succes'
    });
}));

// DELETE /api/payments/:id - Ștergere plată (doar admin, pentru corecții)
router.delete('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    const payment = await db.get('payments', req.params.id);

    if (!payment) {
        throw new ApiError('Plată negăsită', 404, 'PAYMENT_NOT_FOUND');
    }

    await db.delete('payments', req.params.id);

    res.json({
        success: true,
        message: 'Plată ștearsă cu succes'
    });
}));

module.exports = router;
