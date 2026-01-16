/**
 * Custom hook for managing prospects data with API integration
 */

import { useState, useEffect, useCallback } from 'react';
import { Prospect } from '../types';
import { prospectsAPI } from '../lib/apiClient';
import { useNotifications } from '../context/NotificationContext';

interface UseProspectsReturn {
    prospects: Prospect[];
    loading: boolean;
    error: string | null;
    addProspect: (prospect: Omit<Prospect, 'id' | 'avatar' | 'lastContacted'>) => Promise<void>;
    updateProspect: (prospect: Prospect) => Promise<void>;
    deleteProspect: (id: string) => Promise<void>;
    bulkDelete: (ids: string[]) => Promise<void>;
    bulkAddTags: (ids: string[], tags: string[]) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useProspects = (useAPI: boolean = true): UseProspectsReturn => {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { notify } = useNotifications();

    const fetchProspects = useCallback(async () => {
        if (!useAPI) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await prospectsAPI.getAll();
            setProspects(data);
        } catch (err: any) {
            setError(err.message);
            notify(`Eroare la încărcarea prospects: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [useAPI, notify]);

    useEffect(() => {
        fetchProspects();
    }, [fetchProspects]);

    const addProspect = useCallback(async (prospectData: Omit<Prospect, 'id' | 'avatar' | 'lastContacted'>) => {
        if (!useAPI) return;

        try {
            const newProspect = await prospectsAPI.create(prospectData);
            setProspects(prev => [...prev, newProspect]);
            notify('Prospect adăugat cu succes!', 'success');
        } catch (err: any) {
            notify(`Eroare la adăugarea prospect: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const updateProspect = useCallback(async (prospect: Prospect) => {
        if (!useAPI) return;

        try {
            const updated = await prospectsAPI.update(prospect.id, prospect);
            setProspects(prev => prev.map(p => p.id === prospect.id ? updated : p));
            notify('Prospect actualizat!', 'success');
        } catch (err: any) {
            notify(`Eroare la actualizare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const deleteProspect = useCallback(async (id: string) => {
        if (!useAPI) return;

        try {
            await prospectsAPI.delete(id);
            setProspects(prev => prev.filter(p => p.id !== id));
            notify('Prospect eliminat!', 'success');
        } catch (err: any) {
            notify(`Eroare la eliminare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const bulkDelete = useCallback(async (ids: string[]) => {
        if (!useAPI) return;

        try {
            await prospectsAPI.bulkDelete(ids);
            setProspects(prev => prev.filter(p => !ids.includes(p.id)));
            notify(`${ids.length} prospects eliminați!`, 'success');
        } catch (err: any) {
            notify(`Eroare la eliminare în masă: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    const bulkAddTags = useCallback(async (ids: string[], tags: string[]) => {
        if (!useAPI) return;

        try {
            await prospectsAPI.addTags(ids, tags);
            setProspects(prev => prev.map(p =>
                ids.includes(p.id)
                    ? { ...p, tags: Array.from(new Set([...p.tags, ...tags])) }
                    : p
            ));
            notify('Tag-uri adăugate!', 'success');
        } catch (err: any) {
            notify(`Eroare: ${err.message}`, 'error');
            throw err;
        }
    }, [useAPI, notify]);

    return {
        prospects,
        loading,
        error,
        addProspect,
        updateProspect,
        deleteProspect,
        bulkDelete,
        bulkAddTags,
        refresh: fetchProspects,
    };
};
