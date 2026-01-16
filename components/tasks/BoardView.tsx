import React, { useState, DragEvent, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { Assignee, GroupByType, STATUSES, PRIORITIES } from '../Tasks';
import * as Icons from '../icons';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface BoardViewProps {
    tasks: Task[];
    allAssignees: Assignee[];
    onTaskClick: (task: Task) => void;
    onTaskUpdate: (task: Task) => void;
    groupBy: GroupByType;
    onNewTask: (task: null, status: TaskStatus) => void;
}

const TaskCard: React.FC<{ task: Task; assignee?: Assignee; onClick: () => void }> = ({ task, assignee, onClick }) => {
    const priorityInfo = PRIORITIES.find(p => p.id === task.priority);
    const isOverdue = !task.isArchived && task.status !== 'completed' && isPast(parseISO(task.endDate)) && !isToday(parseISO(task.endDate));
    
    return (
        <div 
            draggable 
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
            onClick={onClick}
            className="bg-card-dark p-3 rounded-lg border border-border-dark shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex justify-between items-start mb-2">
                {priorityInfo && (
                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${priorityInfo.color}`}>
                        <priorityInfo.icon className="w-3 h-3" />
                        {priorityInfo.title}
                    </span>
                )}
                {isOverdue && <span className="text-[10px] font-bold text-red-500 uppercase">Restanță</span>}
            </div>
            <h4 className="text-sm font-semibold text-text-dark-primary mb-3 line-clamp-2">{task.name}</h4>
            <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center gap-1.5 text-text-dark-secondary">
                    <Icons.CalendarIcon className="w-3.5 h-3.5" />
                    <span className={`text-[11px] ${isOverdue ? 'text-red-400' : ''}`}>
                        {format(parseISO(task.endDate), 'd MMM')}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {task.checklist && task.checklist.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-text-dark-secondary">
                            <Icons.ClipboardCheckIcon className="w-3 h-3" />
                            {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                        </div>
                    )}
                    <div className="w-6 h-6 bg-primary-800 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-200 border border-border-dark overflow-hidden" title={assignee?.name}>
                        {assignee?.avatar || '?'}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BoardView: React.FC<BoardViewProps> = ({ tasks, allAssignees, onTaskClick, onTaskUpdate, groupBy, onNewTask }) => {
    const [draggingOver, setDraggingOver] = useState<string | null>(null);

    const columns = useMemo(() => {
        if (groupBy === 'status') {
            return STATUSES.map(s => ({
                id: s.id,
                title: s.title,
                tasks: tasks.filter(t => t.status === s.id)
            }));
        }
        if (groupBy === 'priority') {
            return PRIORITIES.map(p => ({
                id: p.id,
                title: p.title,
                tasks: tasks.filter(t => t.priority === p.id)
            }));
        }
        if (groupBy === 'assignee') {
            return allAssignees.map(a => ({
                id: a.id,
                title: a.name,
                tasks: tasks.filter(t => t.assigneeId === (a.id === 'unassigned' ? null : a.id))
            }));
        }
        return [];
    }, [tasks, groupBy, allAssignees]);

    const handleDrop = (e: DragEvent, columnId: string) => {
        e.preventDefault();
        setDraggingOver(null);
        const taskId = e.dataTransfer.getData('taskId');
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;

        let updatedTask = { ...task };
        if (groupBy === 'status') {
            updatedTask.status = columnId as TaskStatus;
        } else if (groupBy === 'priority') {
            updatedTask.priority = columnId as TaskPriority;
        } else if (groupBy === 'assignee') {
            updatedTask.assigneeId = columnId === 'unassigned' ? null : columnId;
        }

        onTaskUpdate(updatedTask);
    };

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
            {columns.map(col => (
                <div 
                    key={col.id} 
                    onDragOver={(e) => { e.preventDefault(); setDraggingOver(col.id); }}
                    onDragLeave={() => setDraggingOver(null)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`flex-shrink-0 w-80 flex flex-col rounded-xl transition-all ${draggingOver === col.id ? 'bg-primary-500/10 scale-[1.01]' : 'bg-gray-50/50 dark:bg-background-dark/30'}`}
                >
                    <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-text-light-primary dark:text-text-dark-primary uppercase tracking-widest">{col.title}</h3>
                            <span className="bg-gray-200 dark:bg-border-dark text-text-dark-secondary text-[10px] px-2 py-0.5 rounded-full font-black">
                                {col.tasks.length}
                            </span>
                        </div>
                        {groupBy === 'status' && (
                            <button onClick={() => onNewTask(null, col.id as TaskStatus)} className="p-1 hover:bg-border-dark rounded-lg transition-colors text-text-dark-secondary">
                                <Icons.PlusIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 min-h-[200px] scrollbar-thin">
                        {col.tasks.map(task => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                assignee={allAssignees.find(a => a.id === (task.assigneeId || 'unassigned'))}
                                onClick={() => onTaskClick(task)} 
                            />
                        ))}
                        {col.tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <Icons.ClipboardListIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs font-bold uppercase tracking-tighter">Nicio sarcină</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BoardView;