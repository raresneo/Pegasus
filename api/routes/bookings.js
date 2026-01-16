const express = require('express');
const router = express.Router();
const db = require('../supabase/db'); // Use Supabase db layer
const auth = require('../auth');
const { validateBookingData, asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// Helper pentru verificare conflicte
const checkConflict = async (booking, bookingId = null) => {
    const allBookings = await db.read('bookings');

    return allBookings.some(b => {
        // Exclude booking-ul curent dacă e update
        if (bookingId && (b.id === bookingId || b.id.startsWith(`${bookingId}_`) || bookingId.startsWith(`${b.id}_`))) {
            return false;
        }

        // Verifică doar aceeași resursă
        if (b.resourceId !== booking.resourceId) return false;

        // Ignoră booking-urile anulate
        if (b.status === 'cancelled') return false;

        // Verifică overlap de timp
        const existingStart = new Date(b.startTime);
        const existingEnd = new Date(b.endTime);
        const newStart = new Date(booking.startTime);
        const newEnd = new Date(booking.endTime);

        return (newStart < existingEnd) && (newEnd > existingStart);
    });
};

// GET /api/bookings - Lista programări (cu filtre)
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { resourceId, memberId, status, startDate, endDate, page = 1, limit = 100 } = req.query;

    let bookings = await db.read('bookings');

    // Filtrare după resursă
    if (resourceId) {
        bookings = bookings.filter(b => b.resourceId === resourceId);
    }

    // Filtrare după membru
    if (memberId) {
        bookings = bookings.filter(b => b.memberId === memberId);
    }

    // Filtrare după status
    if (status) {
        bookings = bookings.filter(b => b.status === status);
    }

    // Filtrare după interval dată
    if (startDate) {
        const start = new Date(startDate);
        bookings = bookings.filter(b => new Date(b.startTime) >= start);
    }

    if (endDate) {
        const end = new Date(endDate);
        bookings = bookings.filter(b => new Date(b.endTime) <= end);
    }

    // Sortare după data de start
    bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Paginare
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            bookings: paginatedBookings,
            total: bookings.length,
            page: parseInt(page),
            totalPages: Math.ceil(bookings.length / parseInt(limit))
        }
    });
}));

// GET /api/bookings/:id - Detalii programare
router.get('/:id', auth.verifyToken, asyncHandler(async (req, res) => {
    const booking = await db.get('bookings', req.params.id);

    if (!booking) {
        throw new ApiError('Programare negăsită', 404, 'BOOKING_NOT_FOUND');
    }

    res.json({
        success: true,
        data: booking
    });
}));

// POST /api/bookings - Creare programare nouă (cu validare conflicte)
router.post('/', auth.verifyToken, validateBookingData, asyncHandler(async (req, res) => {
    const { title, description, startTime, endTime, resourceId, memberId, type, status = 'confirmed' } = req.body;

    const newBooking = {
        title,
        description: description || '',
        startTime,
        endTime,
        resourceId,
        memberId: memberId || null,
        type: type || 'session',
        status,
        color: req.body.color || '#3B82F6'
    };

    // Verificare conflicte
    const hasConflict = await checkConflict(newBooking);
    if (hasConflict) {
        throw new ApiError('Există deja o programare în acest interval pentru această resursă', 409, 'BOOKING_CONFLICT');
    }

    const savedBooking = await db.add('bookings', newBooking);

    res.status(201).json({
        success: true,
        data: savedBooking,
        message: 'Programare creată cu succes'
    });
}));

// PUT /api/bookings/:id - Modificare programare
router.put('/:id', auth.verifyToken, asyncHandler(async (req, res) => {
    const booking = await db.get('bookings', req.params.id);

    if (!booking) {
        throw new ApiError('Programare negăsită', 404, 'BOOKING_NOT_FOUND');
    }

    const { title, description, startTime, endTime, resourceId, status } = req.body;

    const updatedBooking = {
        title: title || booking.title,
        description: description !== undefined ? description : booking.description,
        startTime: startTime || booking.startTime,
        endTime: endTime || booking.endTime,
        resourceId: resourceId || booking.resourceId,
        status: status || booking.status
    };

    // Verificare conflicte (doar dacă se schimbă timpul sau resursa)
    if (startTime || endTime || resourceId) {
        const hasConflict = await checkConflict({
            ...booking,
            ...updatedBooking
        }, req.params.id);

        if (hasConflict) {
            throw new ApiError('Există deja o programare în acest interval pentru această resursă', 409, 'BOOKING_CONFLICT');
        }
    }

    const result = await db.update('bookings', req.params.id, updatedBooking);

    res.json({
        success: true,
        data: result,
        message: 'Programare actualizată cu succes'
    });
}));

// DELETE /api/bookings/:id - Anulare programare
router.delete('/:id', auth.verifyToken, asyncHandler(async (req, res) => {
    const booking = await db.get('bookings', req.params.id);

    if (!booking) {
        throw new ApiError('Programare negăsită', 404, 'BOOKING_NOT_FOUND');
    }

    // În loc să ștergem, marcăm ca anulată
    await db.update('bookings', req.params.id, { status: 'cancelled' });

    res.json({
        success: true,
        message: 'Programare anulată cu succes'
    });
}));

// GET /api/bookings/resource/:resourceId/availability - Verificare disponibilitate
router.get('/resource/:resourceId/availability', auth.verifyToken, asyncHandler(async (req, res) => {
    const { date, duration = 60 } = req.query; // duration în minute

    if (!date) {
        throw new ApiError('Data este obligatorie', 400, 'INVALID_DATE');
    }

    const targetDate = new Date(date);
    const dayStart = new Date(targetDate.setHours(0, 0, 0, 0));
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    // Obține toate programările pentru resursa și ziua specificată
    const allBookings = await db.read('bookings');
    const dayBookings = allBookings.filter(b =>
        b.resourceId === req.params.resourceId &&
        b.status !== 'cancelled' &&
        new Date(b.startTime) >= dayStart &&
        new Date(b.startTime) <= dayEnd
    );

    // Sortare după ora de start
    dayBookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Generare sloturi disponibile (de ex: 08:00 - 22:00)
    const slots = [];
    const workDayStart = new Date(targetDate.setHours(8, 0, 0, 0));
    const workDayEnd = new Date(targetDate.setHours(22, 0, 0, 0));

    let currentSlot = new Date(workDayStart);
    while (currentSlot < workDayEnd) {
        const slotEnd = new Date(currentSlot.getTime() + parseInt(duration) * 60000);

        // Verifică dacă există conflict
        const hasConflict = dayBookings.some(b => {
            const bookingStart = new Date(b.startTime);
            const bookingEnd = new Date(b.endTime);
            return (currentSlot < bookingEnd) && (slotEnd > bookingStart);
        });

        if (!hasConflict) {
            slots.push({
                start: currentSlot.toISOString(),
                end: slotEnd.toISOString(),
                available: true
            });
        }

        // Avansează la următorul slot (30 min increment)
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
    }

    res.json({
        success: true,
        data: {
            date: date,
            resourceId: req.params.resourceId,
            availableSlots: slots,
            bookedSlots: dayBookings.map(b => ({
                start: b.startTime,
                end: b.endTime,
                title: b.title
            }))
        }
    });
}));

module.exports = router;
