const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/prospects - Lista prospecți
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { status } = req.query;

    let prospects = await db.read('prospects');

    if (status) {
        prospects = prospects.filter(p => p.status === status);
    }

    res.json({
        success: true,
        data: prospects
    });
}));

// POST /api/prospects - Adăugare prospect
router.post('/', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const { name, email, phone, status } = req.body;

    if (!name || !email) {
        throw new ApiError('Nume și email sunt obligatorii', 400, 'INVALID_PROSPECT_DATA');
    }

    const newProspect = await db.add('prospects', {
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        status: status || 'uncontacted',
        lastContacted: 'Niciodată',
        tags: [],
        avatar: name[0].toUpperCase(),
        locationId: 'loc_central'
    });

    res.status(201).json({
        success: true,
        data: newProspect,
        message: 'Prospect adăugat'
    });
}));

// PUT /api/prospects/:id - Actualizare prospect
router.put('/:id', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const prospect = await db.get('prospects', req.params.id);

    if (!prospect) {
        throw new ApiError('Prospect negăsit', 404, 'PROSPECT_NOT_FOUND');
    }

    const updatedProspect = await db.update('prospects', req.params.id, req.body);

    res.json({
        success: true,
        data: updatedProspect
    });
}));

// DELETE /api/prospects/:id - Ștergere prospect
router.delete('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    await db.delete('prospects', req.params.id);

    res.json({
        success: true,
        message: 'Prospect șters'
    });
}));

// POST /api/prospects/:id/convert - Convertire în membru
router.post('/:id/convert', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const prospect = await db.get('prospects', req.params.id);

    if (!prospect) {
        throw new ApiError('Prospect negăsit', 404, 'PROSPECT_NOT_FOUND');
    }

    const { tierId } = req.body;

    // Creează membru din prospect
    const nameParts = prospect.name.split(' ');
    const newMember = await db.add('members', {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: prospect.email,
        phone: prospect.phone,
        joinDate: new Date().toISOString(),
        avatar: prospect.avatar,
        membership: {
            tierId: tierId || 'none',
            status: tierId ? 'active' : 'expired',
            startDate: tierId ? new Date().toISOString() : '',
            endDate: tierId ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : ''
        },
        locationId: prospect.locationId || 'loc_central',
        memberType: 'member'
    });

    // Șterge prospect-ul
    await db.delete('prospects', req.params.id);

    res.json({
        success: true,
        data: newMember,
        message: 'Prospect convertit în membru'
    });
}));

module.exports = router;
