import React, { useState } from 'react';
import FormModal from '../../FormModal';
import { User } from '../../../types';
import * as Icons from '../../icons';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, type: 'public' | 'private', participantIds: string[]) => void;
    users: User[];
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onCreate, users }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'public' | 'private'>('public');
    const [participants, setParticipants] = useState<string[]>([]);
    const [userSearch, setUserSearch] = useState('');

    const handleToggleParticipant = (userId: string) => {
        setParticipants(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const handleCreate = () => {
        if (name) {
            onCreate(name, type, participants);
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Create New Channel">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Channel Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="p-2 w-full bg-background-dark rounded-md border border-border-dark" placeholder="e.g. marketing-team"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Type</label>
                    <div className="flex items-center gap-2 bg-background-dark p-1 rounded-lg">
                        <button type="button" onClick={() => setType('public')} className={`px-3 py-1 text-sm rounded-md flex-1 ${type === 'public' ? 'bg-primary-500 text-white' : ''}`}>Public</button>
                        <button type="button" onClick={() => setType('private')} className={`px-3 py-1 text-sm rounded-md flex-1 ${type === 'private' ? 'bg-primary-500 text-white' : ''}`}>Private</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Add Members</label>
                    <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search for users..." className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/>
                    <div className="max-h-40 overflow-y-auto mt-2 space-y-1 pr-2">
                        {filteredUsers.map(user => (
                            <label key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-background-dark cursor-pointer">
                                <input type="checkbox" checked={participants.includes(user.id)} onChange={() => handleToggleParticipant(user.id)} className="h-4 w-4 rounded text-primary-500 bg-background-dark border-border-dark" />
                                <div className="w-6 h-6 bg-primary-800 rounded-full flex items-center justify-center font-bold text-xs text-primary-200">{user.avatar}</div>
                                <span>{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                <button onClick={handleCreate} disabled={!name} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-600">Create</button>
            </div>
        </FormModal>
    );
};

export default CreateChannelModal;
