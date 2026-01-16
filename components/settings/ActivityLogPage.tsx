import React, { useMemo, useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { mockUsers } from '../../lib/data';
import * as Icons from '../icons';
import { format, formatDistanceToNow } from 'date-fns';

const ActivityLogPage: React.FC = () => {
    const { activityLogs } = useDatabase();
    const [searchTerm, setSearchTerm] = useState('');

    const usersMap = useMemo(() => new Map(mockUsers.map(u => [u.id, u])), []);
    
    const filteredLogs = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return activityLogs
            .filter(log => 
                log.entityName.toLowerCase().includes(lowerSearch) ||
                log.details.toLowerCase().includes(lowerSearch) ||
                (usersMap.get(log.userId)?.name || '').toLowerCase().includes(lowerSearch)
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [activityLogs, searchTerm, usersMap]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Activity Log</h1>
                <p className="text-text-dark-secondary mt-1">A complete audit trail of all actions performed in the system.</p>
            </div>
            <div className="relative">
                <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                <input
                    type="text"
                    placeholder="Search logs by user, action, or entity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 p-2 w-full sm:w-96 bg-card-dark rounded-md border border-border-dark"
                />
            </div>
             <div className="bg-card-dark rounded-lg shadow-md overflow-hidden border border-border-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-dark-secondary">
                        <thead className="text-xs text-text-dark-primary uppercase bg-background-dark">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Entity</th>
                                <th className="px-6 py-3">Details</th>
                                <th className="px-6 py-3">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {filteredLogs.map(log => {
                                const user = usersMap.get(log.userId);
                                return (
                                    <tr key={log.id} className="hover:bg-background-dark/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-primary-800 rounded-full flex items-center justify-center font-bold text-xs text-primary-200">{user?.avatar}</div>
                                                <span className="font-semibold text-text-dark-primary">{user?.name || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize font-semibold">{log.action.replace('_', ' ')}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-text-dark-primary">{log.entityName}</span>
                                            <span className="text-xs ml-2">({log.entityType})</span>
                                        </td>
                                        <td className="px-6 py-4">{log.details}</td>
                                        <td className="px-6 py-4" title={format(new Date(log.timestamp), 'PPpp')}>
                                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredLogs.length === 0 && (
                        <div className="text-center py-16">
                            <Icons.ListBulletIcon className="mx-auto h-12 w-12 text-border-dark" />
                            <h3 className="mt-2 text-lg font-semibold text-text-dark-primary">No Logs Found</h3>
                            <p className="mt-1 text-sm">Try a different search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogPage;