import { useState, useEffect, useCallback } from 'react';
import { membersAPI } from '../lib/apiClient';
import { Member } from '../types';

interface UseMembersOptions {
    autoFetch?: boolean;
}

export const useMembers = (options: UseMembersOptions = {}) => {
    const { autoFetch = true } = options;

    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await membersAPI.getAll();
            setMembers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch members');
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchMembers();
        }
    }, [autoFetch, fetchMembers]);

    const addMember = async (memberData: Partial<Member>) => {
        try {
            setLoading(true);
            const newMember = await membersAPI.create(memberData);
            setMembers(prev => [newMember, ...prev]);
            return newMember;
        } catch (err: any) {
            setError(err.message || 'Failed to add member');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMember = async (id: string, updates: Partial<Member>) => {
        try {
            setLoading(true);
            const updated = await membersAPI.update(id, updates);
            setMembers(prev => prev.map(m => m.id === id ? updated : m));
            return updated;
        } catch (err: any) {
            setError(err.message || 'Failed to update member');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteMember = async (id: string) => {
        try {
            setLoading(true);
            await membersAPI.delete(id);
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete member');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const bulkDelete = async (ids: string[]) => {
        try {
            setLoading(true);
            await membersAPI.bulkDelete(ids);
            setMembers(prev => prev.filter(m => !ids.includes(m.id)));
        } catch (err: any) {
            setError(err.message || 'Failed to delete members');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addTag = async (memberId: string, tag: string) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        const tags = member.tags || [];
        if (tags.includes(tag)) return;

        await updateMember(memberId, { tags: [...tags, tag] });
    };

    const removeTag = async (memberId: string, tag: string) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        const tags = (member.tags || []).filter(t => t !== tag);
        await updateMember(memberId, { tags });
    };

    const refresh = () => {
        fetchMembers();
    };

    return {
        members,
        loading,
        error,
        addMember,
        updateMember,
        deleteMember,
        bulkDelete,
        addTag,
        removeTag,
        refresh
    };
};
