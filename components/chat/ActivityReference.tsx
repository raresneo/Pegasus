
import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';
import { formatDistanceToNow } from 'date-fns';

interface ActivityReferenceProps {
    activityId: string;
    taskId: string;
}

const ActivityReference: React.FC<ActivityReferenceProps> = ({ activityId, taskId }) => {
    // FIX: Changed mockUsers to users to match the DatabaseContextType property name.
    const { activityLogs, tasks, users } = useDatabase();
    
    const activity = activityLogs.find(a => a.id === activityId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!activity || !task) {
        return <span className="text-red-400">[Activity not found]</span>;
    }

    const user = users.find(u => u.id === activity.userId);

    return (
        <div className="my-2 p-3 rounded-md border border-border-dark bg-background-dark inline-block w-full max-w-md">
             <div className="text-xs text-text-dark-secondary mb-1">
                Activity from task: <span className="font-semibold text-text-dark-primary">{task.name}</span>
             </div>
            <div className="flex items-start gap-2">
                <Icons.ListBulletIcon className="w-4 h-4 mt-0.5 text-text-dark-secondary flex-shrink-0"/>
                <div className="text-sm">
                    <span className="font-semibold">{user?.name || 'System'}</span>
                    <span> {activity.details} </span>
                    <span className="text-xs text-text-dark-secondary">
                        ({formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })})
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ActivityReference;
