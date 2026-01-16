import React, { useState } from 'react';
import FormModal from '../../FormModal';
import { ActivityLog, User } from '../../../types';
import { formatDistanceToNow } from 'date-fns';

interface ImportActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (activityIds: string[]) => void;
    activities: ActivityLog[];
    users: User[];
}

const ImportActivityModal: React.FC<ImportActivityModalProps> = ({ isOpen, onClose, onImport, activities, users }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggle = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };
    
    const handleImport = () => {
        onImport(selectedIds);
        setSelectedIds([]);
    };

    const usersMap = new Map<string, User>(users.map(u => [u.id, u]));

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Import Task Activity">
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {activities.length > 0 ? activities.map(activity => {
                    const user = usersMap.get(activity.userId);
                    return (
                        <label key={activity.id} className="flex items-start gap-3 p-3 rounded-md bg-background-dark hover:bg-border-dark cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(activity.id)}
                                onChange={() => handleToggle(activity.id)}
                                className="mt-1 h-4 w-4 rounded text-primary-500 bg-card-dark border-border-dark"
                            />
                            <div>
                                <p className="text-sm">
                                    <span className="font-semibold">{user?.name || 'System'}</span> {activity.details}
                                </p>
                                <p className="text-xs text-text-dark-secondary">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </label>
                    );
                }) : (
                    <p className="text-center text-sm text-text-dark-secondary py-8">No recent activity on linked tasks.</p>
                )}
            </div>
             <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                <button onClick={handleImport} disabled={selectedIds.length === 0} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-600">
                    Import ({selectedIds.length})
                </button>
            </div>
        </FormModal>
    );
};

export default ImportActivityModal;
