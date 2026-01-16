const { ApiError } = require('./errorHandler');

// Validare email
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validare telefon (format românesc)
const validatePhone = (phone) => {
    const re = /^(\+4|0)[0-9]{9}$/;
    return re.test(phone.replace(/\s/g, ''));
};

// Middleware pentru validarea datelor membri
const validateMemberData = (req, res, next) => {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || firstName.trim().length < 2) {
        throw new ApiError('Prenumele trebuie să aibă minimum 2 caractere', 400, 'INVALID_FIRST_NAME');
    }

    if (!lastName || lastName.trim().length < 2) {
        throw new ApiError('Numele trebuie să aibă minimum 2 caractere', 400, 'INVALID_LAST_NAME');
    }

    if (!email || !validateEmail(email)) {
        throw new ApiError('Email invalid', 400, 'INVALID_EMAIL');
    }

    if (phone && !validatePhone(phone)) {
        throw new ApiError('Număr de telefon invalid', 400, 'INVALID_PHONE');
    }

    next();
};

// Middleware pentru validarea datelor programare
const validateBookingData = (req, res, next) => {
    const { title, startTime, endTime, resourceId } = req.body;

    if (!title || title.trim().length === 0) {
        throw new ApiError('Titlul programării este obligatoriu', 400, 'INVALID_TITLE');
    }

    if (!startTime || !endTime) {
        throw new ApiError('Data de început și sfârșit sunt obligatorii', 400, 'INVALID_DATES');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ApiError('Format dată invalid', 400, 'INVALID_DATE_FORMAT');
    }

    if (end <= start) {
        throw new ApiError('Data de sfârșit trebuie să fie după data de început', 400, 'INVALID_DATE_RANGE');
    }

    if (!resourceId) {
        throw new ApiError('Resursa este obligatorie', 400, 'INVALID_RESOURCE');
    }

    next();
};

// Middleware pentru validarea datelor plată
const validatePaymentData = (req, res, next) => {
    const { memberId, amount, method } = req.body;

    if (!memberId) {
        throw new ApiError('ID membru este obligatoriu', 400, 'INVALID_MEMBER_ID');
    }

    if (!amount || amount <= 0) {
        throw new ApiError('Suma trebuie să fie mai mare decât 0', 400, 'INVALID_AMOUNT');
    }

    if (!method || !['cash', 'card', 'transfer', 'other'].includes(method.toLowerCase())) {
        throw new ApiError('Metodă de plată invalidă', 400, 'INVALID_PAYMENT_METHOD');
    }

    next();
};

// Middleware pentru validarea datelor task
const validateTaskData = (req, res, next) => {
    const { name, priority, status } = req.body;

    if (!name || name.trim().length === 0) {
        throw new ApiError('Numele task-ului este obligatoriu', 400, 'INVALID_TASK_NAME');
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
        throw new ApiError('Prioritate invalidă', 400, 'INVALID_PRIORITY');
    }

    if (status && !['todo', 'in_progress', 'done', 'cancelled'].includes(status)) {
        throw new ApiError('Status invalid', 400, 'INVALID_STATUS');
    }

    next();
};

// Wrapper async pentru gestionarea automată a erorilor
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    validateMemberData,
    validateBookingData,
    validatePaymentData,
    validateTaskData,
    asyncHandler,
    validateEmail,
    validatePhone
};
