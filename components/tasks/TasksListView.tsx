import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { Assignee, STATUSES, PRIORITIES } from '../Tasks';
import * as Icons from '../icons';
import { format, parseISO } from 'date-fns';

interface TasksListViewProps {
    tasks: Task[];
    allAssignees: Assignee[];
    onTaskClick: (task: Task) => void;
    updateTask: (task: Task) => void;
}

const TasksListView: React.FC<TasksListViewProps> = ({ tasks, allAssignees, onTaskClick, updateTask }) => {
    
    const handleFieldChange = (task: Task, field: keyof Task, value: any) => {
        updateTask({ ...task, [field]: value });
    };

    return (
         <div className="overflow-x-auto bg-card-dark rounded-lg border border-border-dark">
            <table className="w-full text-sm text-left text-text-dark-secondary">
                <thead className="text-xs text-text-dark-primary uppercase bg-background-dark">
                    <tr>
                        <th className="px-6 py-3">Task Name</th>
                        <th className="px-6 py-3">Assignee</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Due Date</th>
                    </tr>
                </thead>
                <tbody>
                {tasks.map(task => {
                    const assignee = allAssignees.find(a => a.id === task.assigneeId);
                    return (
                        <tr key={task.id} onClick={() => onTaskClick(task)} className="bg-card-dark border-b border-border-dark hover:bg-border-dark/20 cursor-pointer">
                            <td className="px-6 py-4 font-medium text-text-dark-primary">
                                <span className="flex items-center gap-2">
                                    {task.parentId && <Icons.CornerDownRightIcon className="w-4 h-4 text-text-dark-secondary" title="Subtask"/>}
                                    {task.name}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <select value={task.assigneeId || 'unassigned'} onChange={(e) => handleFieldChange(task, 'assigneeId', e.target.value === 'unassigned' ? null : e.target.value)} onClick={e => e.stopPropagation()} className="p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-primary-500 hover:bg-border-dark">
                                    {allAssignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <select value={task.status} onChange={(e) => handleFieldChange(task, 'status', e.target.value)} onClick={e => e.stopPropagation()} className="p-1 rounded bg-transparent border-none capitalize focus:ring-1 focus:ring-primary-500 hover:bg-border-dark">
                                    {STATUSES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <select value={task.priority} onChange={(e) => handleFieldChange(task, 'priority', e.target.value)} onClick={e => e.stopPropagation()} className="p-1 rounded bg-transparent border-none capitalize focus:ring-1 focus:ring-primary-500 hover:bg-border-dark">
                                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <input type="date" value={format(parseISO(task.endDate), 'yyyy-MM-dd')} onChange={(e) => handleFieldChange(task, 'endDate', new Date(e.target.value).toISOString())} onClick={e => e.stopPropagation()} className="p-1 rounded bg-transparent border-none focus:ring-1 focus:ring-primary-500 hover:bg-border-dark"/>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            {tasks.length === 0 && (
                <div className="text-center py-16 text-text-dark-secondary">
                    <Icons.ClipboardListIcon className="mx-auto h-12 w-12 text-border-dark" />
                    <h3 className="mt-2 text-lg font-semibold text-text-dark-primary">No tasks found</h3>
                    <p className="mt-1 text-sm">Try adjusting your filters or creating a new task.</p>
                </div>
            )}
        </div>
    );
};

export default TasksListView;