import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types';
import { tasksAPI } from '../lib/apiClient';
import { useNotifications } from '../context/NotificationContext';

interface UseTasksReturn {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    archiveTask: (id: string) => Promise<void>;
    unarchiveTask: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useTasks = (useAPI: boolean = true): UseTasksReturn => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { notify } = useNotifications();

    const fetchTasks = useCallback(async () => {
        if (!useAPI) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await tasksAPI.getAll();
            setTasks(data);
        } catch (err: any) {
            setError(err.message);
            notify(`Eroare la încărcarea task-urilor: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [useAPI, notify]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!useAPI) return;

        try {
            const newTask = await tasksAPI.create(taskData);
            setTasks(prev => [...prev, newTask]);
            notify('Task creat cu succes!', 'success');
        } catch (err: any) {
            notify(`Eroare la crearea task: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const updateTask = useCallback(async (task: Task) => {
        if (!useAPI) return;

        try {
            const updated = await tasksAPI.update(task.id, task);
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
            notify('Task actualizat!', 'success');
        } catch (err: any) {
            notify(`Eroare la actualizare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const deleteTask = useCallback(async (id: string) => {
        if (!useAPI) return;

        try {
            await tasksAPI.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            notify('Task eliminat!', 'success');
        } catch (err: any) {
            notify(`Eroare la eliminare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const archiveTask = useCallback(async (id: string) => {
        if (!useAPI) return;

        try {
            await tasksAPI.archive(id, true);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
            notify('Task arhivat!', 'success');
        } catch (err: any) {
            notify(`Eroare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const unarchiveTask = useCallback(async (id: string) => {
        if (!useAPI) return;

        try {
            await tasksAPI.archive(id, false);
            setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
            notify('Task restaurat!', 'success');
        } catch (err: any) {
            notify(`Eroare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    return {
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        archiveTask,
        unarchiveTask,
        refresh: fetchTasks,
    };
};
