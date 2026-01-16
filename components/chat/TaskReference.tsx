import React from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';
import { STATUSES } from '../Tasks';

interface TaskReferenceProps {
    taskId: string;
}

const TaskReference: React.FC<TaskReferenceProps> = ({ taskId }) => {
    const { tasks } = useDatabase();
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return <span className="text-red-400">[Task not found]</span>;
    }

    const status = STATUSES.find(s => s.id === task.status);

    return (
        <div className="my-2 p-3 rounded-md border border-border-dark bg-background-dark inline-block w-full max-w-md">
            <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{task.name}</p>
                {status && (
                    <span className={`px-2 py-0.5 text-xs rounded-full bg-${status.color}-500/10 text-${status.color}-400`}>
                        {status.title}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TaskReference;
