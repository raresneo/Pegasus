const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { validateMemberData, asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/members - Lista tuturor membrilor (cu filtrare și paginare)
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { status, locationId, search, page = 1, limit = 50 } = req.query;

    let members = await db.read('members');

    // Filtrare după status
    if (status) {
        members = members.filter(m => m.membership?.status === status);
    }

    // Filtrare după locație
    if (locationId && locationId !== 'all') {
        members = members.filter(m => m.locationId === locationId);
    }

    // Căutare după nume sau email
    if (search) {
        const searchLower = search.toLowerCase();
        members = members.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchLower) ||
            m.email?.toLowerCase().includes(searchLower)
        );
    }

    // Paginare
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedMembers = members.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            members: paginatedMembers,
            total: members.length,
            page: parseInt(page),
            totalPages: Math.ceil(members.length / parseInt(limit))
        }
    });
}));

// GET /api/members/:id - Detalii membru specific
router.get('/:id', auth.verifyToken, asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.id);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    res.json({
        success: true,
        data: member
    });
}));

// POST /api/members - Adăugare membru nou
router.post('/', auth.verifyToken, auth.authorize(['admin', 'trainer']), validateMemberData, asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, locationId, memberType } = req.body;

    // Verificare email duplicat
    const existingMembers = await db.read('members');
    if (existingMembers.find(m => m.email?.toLowerCase() === email.toLowerCase())) {
        throw new ApiError('Un membru cu acest email există deja', 400, 'DUPLICATE_EMAIL');
    }

    const newMember = await db.add('members', {
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        joinDate: new Date().toISOString(),
        avatar: `${firstName[0]}${lastName[0]}`.toUpperCase(),
        membership: {
            status: 'expired',
            tierId: 'none',
            startDate: '',
            endDate: ''
        },
        locationId: locationId || 'loc_central',
        memberType: memberType || 'member',
        visitHistory: [],
        communications: [],
        tags: []
    });

    res.status(201).json({
        success: true,
        data: newMember,
        message: 'Membru ad ăugat cu succes'
    });
}));

// PUT /api/members/:id - Actualizare membru
router.put('/:id', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.id);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    const { firstName, lastName, email, phone, locationId, notes } = req.body;

    // Verificare email duplicat (dacă se schimbă emailul)
    if (email && email.toLowerCase() !== member.email?.toLowerCase()) {
        const existingMembers = await db.read('members');
        if (existingMembers.find(m => m.email?.toLowerCase() === email.toLowerCase() && m.id !== req.params.id)) {
            throw new ApiError('Un membru cu acest email există deja', 400, 'DUPLICATE_EMAIL');
        }
    }

    const updatedMember = await db.update('members', req.params.id, {
        firstName: firstName || member.firstName,
        lastName: lastName || member.lastName,
        email: email ? email.toLowerCase() : member.email,
        phone: phone !== undefined ? phone : member.phone,
        locationId: locationId || member.locationId,
        notes: notes !== undefined ? notes : member.notes
    });

    res.json({
        success: true,
        data: updatedMember,
        message: 'Membru actualizat cu succes'
    });
}));

// DELETE /api/members/:id - Ștergere membru
router.delete('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.id);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    await db.delete('members', req.params.id);

    res.json({
        success: true,
        message: 'Membru șters cu succes'
    });
}));

// POST /api/members/:id/check-in - Înregistrare check-in
router.post('/:id/check-in', auth.verifyToken, asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.id);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    const { method = 'manual', locationId } = req.body;
    const now = new Date().toISOString();
    const finalLocationId = locationId || member.locationId || 'loc_central';

    // Adaugă în access logs
    await db.add('accessLogs', {
        memberId: req.params.id,
        timestamp: now,
        type: 'check_in',
        locationId: finalLocationId,
        method
    });

    // Actualizează visit history
    const visitHistory = member.visitHistory || [];
    visitHistory.push({ date: now, locationId: finalLocationId });

    await db.update('members', req.params.id, {
        visitHistory
    });

    res.json({
        success: true,
        message: 'Check-in înregistrat cu succes',
        data: {
            memberId: req.params.id,
            timestamp: now,
            locationId: finalLocationId
        }
    });
}));

// PUT /api/members/:id/membership - Actualizare abonament
router.put('/:id/membership', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.id);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    const { tierId, status, startDate, endDate } = req.body;

    if (!tierId) {
        throw new ApiError('ID tier abonament este obligatoriu', 400, 'INVALID_TIER_ID');
    }

    if (!status || !['active', 'expired', 'frozen', 'cancelled'].includes(status)) {
        throw new ApiError('Status invalid', 400, 'INVALID_STATUS');
    }

    const updatedMember = await db.update('members', req.params.id, {
        membership: {
            tierId,
            status,
            startDate: startDate || new Date().toISOString(),
            endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 zile default
        }
    });

    res.json({
        success: true,
        data: updatedMember,
        message: 'Abonament actualizat cu succes'
    });
}));

// GET /api/members/:id/history - Istoric activitate membru
router.get('/:id/history', auth.verifyToken, asyncHandler(async (req, res) => {
    const member = await db.get('members', req.params.id);

    if (!member) {
        throw new ApiError('Membru negăsit', 404, 'MEMBER_NOT_FOUND');
    }

    // Obține toate access logs pentru acest membru
    const allLogs = await db.read('accessLogs');
    const memberLogs = allLogs
        .filter(log => log.memberId === req.params.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Obține toate payments pentru acest membru
    const allPayments = await db.read('payments');
    const memberPayments = allPayments
        .filter(payment => payment.memberId === req.params.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
        success: true,
        data: {
            member,
            accessLogs: memberLogs,
            payments: memberPayments,
            visitHistory: member.visitHistory || [],
            communications: member.communications || []
        }
    });
}));

module.exports = router;
