const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../auth');
const { validateTaskData, asyncHandler } = require('../middleware/validation');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/tasks - Lista task-uri (cu filtre)
router.get('/', auth.verifyToken, asyncHandler(async (req, res) => {
    const { status, priority, assigneeId, isArchived, page = 1, limit = 50 } = req.query;

    let tasks = await db.read('tasks');

    // Filtrare după status
    if (status) {
        tasks = tasks.filter(t => t.status === status);
    }

    // Filtrare după prioritate
    if (priority) {
        tasks = tasks.filter(t => t.priority === priority);
    }

    // Filtrare după assignee
    if (assigneeId) {
        tasks = tasks.filter(t => t.assigneeId === assigneeId);
    }

    // Filtrare arhivate/ne-arhivate
    const archived = isArchived === 'true';
    tasks = tasks.filter(t => (t.isArchived || false) === archived);

    // Sortare după prioritate și dată
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => {
        const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Paginare
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            tasks: paginatedTasks,
            total: tasks.length,
            page: parseInt(page),
            totalPages: Math.ceil(tasks.length / parseInt(limit))
        }
    });
}));

// POST /api/tasks - Creare task nou
router.post('/', auth.verifyToken, validateTaskData, asyncHandler(async (req, res) => {
    const { name, description, priority, status, endDate, assigneeId, tags } = req.body;

    const newTask = await db.add('tasks', {
        name,
        description: description || '',
        priority: priority || 'medium',
        status: status || 'todo',
        endDate: endDate || null,
        assigneeId: assigneeId || null,
        tags: tags || [],
        isArchived: false,
        comments: [],
        checklist: []
    });

    res.status(201).json({
        success: true,
        data: newTask,
        message: 'Task creat cu succes'
    });
}));

// PUT /api/tasks/:id - Actualizare task
router.put('/:id', auth.verifyToken, asyncHandler(async (req, res) => {
    const task = await db.get('tasks', req.params.id);

    if (!task) {
        throw new ApiError('Task negăsit', 404, 'TASK_NOT_FOUND');
    }

    const { name, description, priority, status, endDate, assigneeId } = req.body;

    const updatedTask = await db.update('tasks', req.params.id, {
        name: name || task.name,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        status: status || task.status,
        endDate: endDate !== undefined ? endDate : task.endDate,
        assigneeId: assigneeId !== undefined ? assigneeId : task.assigneeId
    });

    res.json({
        success: true,
        data: updatedTask,
        message: 'Task actualizat'
    });
}));

// DELETE /api/tasks/:id - Ștergere task
router.delete('/:id', auth.verifyToken, auth.authorize('admin'), asyncHandler(async (req, res) => {
    const task = await db.get('tasks', req.params.id);

    if (!task) {
        throw new ApiError('Task negăsit', 404, 'TASK_NOT_FOUND');
    }

    await db.delete('tasks', req.params.id);

    res.json({
        success: true,
        message: 'Task șters'
    });
}));

// POST /api/tasks/:id/comments - Adăugare comentariu
router.post('/:id/comments', auth.verifyToken, asyncHandler(async (req, res) => {
    const task = await db.get('tasks', req.params.id);

    if (!task) {
        throw new ApiError('Task negăsit', 404, 'TASK_NOT_FOUND');
    }

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
        throw new ApiError('Comentariul nu poate fi gol', 400, 'INVALID_COMMENT');
    }

    const comments = task.comments || [];
    comments.push({
        id: `c_${Date.now()}`,
        authorId: req.user.id,
        authorName: req.user.name,
        text,
        createdAt: new Date().toISOString()
    });

    await db.update('tasks', req.params.id, { comments });

    res.json({
        success: true,
        message: 'Comentariu ad ăugat'
    });
}));

// PUT /api/tasks/:id/archive - Arhivare/Dezarhivare task
router.put('/:id/archive', auth.verifyToken, asyncHandler(async (req, res) => {
    const task = await db.get('tasks', req.params.id);

    if (!task) {
        throw new ApiError('Task negăsit', 404, 'TASK_NOT_FOUND');
    }

    const isArchived = !(task.isArchived || false);

    await db.update('tasks', req.params.id, { isArchived });

    res.json({
        success: true,
        message: isArchived ? 'Task arhivat' : 'Task dezarhivat'
    });
}));

module.exports = router;
