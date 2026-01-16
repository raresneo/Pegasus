const express = require('express');
const router = express.Router();
const db = require('../supabase/db'); // Use Supabase db layer
const auth = require('../auth');
const { asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/products - Lista produse
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { category, inStock } = req.query;

    let products = await db.read('products');

    if (category) {
        products = products.filter(p => p.category === category);
    }

    if (inStock === 'true') {
        products = products.filter(p => (p.stock || 0) > 0);
    }

    res.json({
        success: true,
        data: products
    });
}));

// POST /api/products - Adăugare produs
router.post('/', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const { name, price, category, stock, description } = req.body;

    if (!name || !price) {
        throw new ApiError('Nume și preț sunt obligatorii', 400, 'INVALID_PRODUCT_DATA');
    }

    const newProduct = await db.add('products', {
        name,
        price: parseFloat(price),
        category: category || 'general',
        stock: stock || 0,
        description: description || ''
    });

    res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Produs adăugat'
    });
}));

// PUT /api/products/:id - Actualizare produs
router.put('/:id', auth.verifyToken, auth.authorize(['admin', 'trainer']), asyncHandler(async (req, res) => {
    const product = await db.get('products', req.params.id);

    if (!product) {
        throw new ApiError('Produs negăsit', 404, 'PRODUCT_NOT_FOUND');
    }

    const updatedProduct = await db.update('products', req.params.id, req.body);

    res.json({
        success: true,
        data: updatedProduct
    });
}));

// DELETE /api/products/:id - Ștergere produs
router.delete('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    await db.delete('products', req.params.id);

    res.json({
        success: true,
        message: 'Produs șters'
    });
}));

module.exports = router;
