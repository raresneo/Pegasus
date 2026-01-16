const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/assets - Lista active
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { status, category, locationId } = req.query;

    let assets = await db.read('assets');

    if (status) {
        assets = assets.filter(a => a.status === status);
    }

    if (category) {
        assets = assets.filter(a => a.category === category);
    }

    if (locationId) {
        assets = assets.filter(a => a.locationId === locationId);
    }

    res.json({
        success: true,
        data: assets
    });
}));

// POST /api/assets - Adăugare activ
router.post('/', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const { name, category, locationId, status } = req.body;

    if (!name) {
        throw new ApiError('Numele activului este obligatoriu', 400, 'INVALID_ASSET_NAME');
    }

    const newAsset = await db.add('assets', {
        name,
        category: category || 'general',
        locationId: locationId || 'loc_central',
        status: status || 'operational',
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // +6 luni
    });

    res.status(201).json({
        success: true,
        data: newAsset,
        message: 'Activ adăugat'
    });
}));

// PUT /api/assets/:id - Actualizare activ
router.put('/:id', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const asset = await db.get('assets', req.params.id);

    if (!asset) {
        throw new ApiError('Activ negăsit', 404, 'ASSET_NOT_FOUND');
    }

    const updatedAsset = await db.update('assets', req.params.id, req.body);

    res.json({
        success: true,
        data: updatedAsset
    });
}));

// DELETE /api/assets/:id - Ștergere activ
router.delete('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    await db.delete('assets', req.params.id);

    res.json({
        success: true,
        message: 'Activ șters'
    });
}));

// PUT /api/assets/:id/maintenance - Actualizare mentenanță
router.put('/:id/maintenance', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const asset = await db.get('assets', req.params.id);

    if (!asset) {
        throw new ApiError('Activ negăsit', 404, 'ASSET_NOT_FOUND');
    }

    const { nextMaintenanceMonths = 6 } = req.body;

    const updatedAsset = await db.update('assets', req.params.id, {
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(Date.now() + nextMaintenanceMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'operational'
    });

    res.json({
        success: true,
        data: updatedAsset,
        message: 'Mentenanță înregistrată'
    });
}));

module.exports = router;
