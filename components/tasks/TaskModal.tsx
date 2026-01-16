import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskChecklistItem, TaskComment, TaskActivity, RecurrenceRule } from '../../types';
import { Assignee, STATUSES, PRIORITIES } from '../Tasks';
import * as Icons from '../icons';
import { format, formatDistanceToNow, addDays, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => void;
    onDelete: (taskId: string) => void;
    onArchive: (taskId: string) => void;
    onUnarchive: (taskId: string) => void;
    onAddComment: (taskId: string, commentText: string) => void;
    onToggleChecklist: (taskId: string, checklistItemId: string) => void;
    onAddSubtask: (parentId: string, subtaskName: string) => void;
    task: Task | null;
    allTasks: Task[];
    allAssignees: Assignee[];
    onOpenTask: (task: Task) => void;
    initialData?: Partial<Omit<Task, 'id'|'createdAt'|'updatedAt'>> | null;
}

const initialTaskState = (defaultStatus: TaskStatus): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => ({
    name: '',
    description: '',
    assigneeId: null,
    status: defaultStatus,
    priority: 'medium',
    endDate: new Date().toISOString(),
    isArchived: false,
    tags: [],
    checklist: [],
    comments: [],
    activity: [],
    dependencies: [],
});

const TaskModal: React.FC<TaskModalProps> = (props) => {
    const { isOpen, onClose, onSave, onDelete, onAddComment, onToggleChecklist, onAddSubtask, task, allTasks, allAssignees, onOpenTask, initialData, onArchive, onUnarchive } = props;
    const { user } = useAuth();
    
    const [localTask, setLocalTask] = useState<Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task>(initialTaskState('todo'));
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [dependencySearch, setDependencySearch] = useState('');
    
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('weekly');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));

    useEffect(() => {
        if (isOpen) {
            if (task) {
                // Find latest version from allTasks to handle reactive updates
                const currentTaskInState = allTasks.find(t => t.id === task.id);
                const taskData = currentTaskInState ? { ...currentTaskInState } : initialTaskState('todo');
                setLocalTask(taskData);
                setIsRecurring(!!taskData.recurrence);
                if (taskData.recurrence) {
                    setRecurrenceRule(taskData.recurrence.rule);
                    setRecurrenceEndDate(format(new Date(taskData.recurrence.endDate), 'yyyy-MM-dd'));
                }
            } else if (initialData) {
                setLocalTask({
                    ...initialTaskState(initialData.status || 'todo'),
                    ...initialData,
                });
                setIsRecurring(false);
            } else {
                setLocalTask(initialTaskState('todo'));
                setIsRecurring(false);
            }
        }
    }, [task, initialData, allTasks, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const finalTask = {
            ...localTask,
            recurrence: isRecurring ? {
                rule: recurrenceRule,
                endDate: new Date(recurrenceEndDate).toISOString(),
                exceptionDates: localTask.recurrence?.exceptionDates || []
            } : undefined
        };
        onSave(finalTask);
        onClose();
    };
    
    const handleDelete = () => { if (task) onDelete(task.id); onClose(); };
    
    const handleAddComment = () => { 
        if (task && newComment.trim()) { 
            onAddComment(task.id, newComment.trim()); 
            setNewComment(''); 
        }
    };
    
    const handleToggleChecklist = (itemId: string) => { 
        if (task) onToggleChecklist(task.id, itemId); 
    };
    
    const handleAddSubtask = () => { 
        if (task && newSubtask.trim()) { 
            onAddSubtask(task.id, newSubtask.trim()); 
            setNewSubtask(''); 
        } 
    };
    
    const handleToggleSubtaskStatus = (e: React.MouseEvent, subtask: Task) => {
        e.stopPropagation(); 
        const newStatus: TaskStatus = subtask.status === 'completed' ? 'todo' : 'completed';
        onSave({ ...subtask, status: newStatus });
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim() === '') return;
        const newItem: TaskChecklistItem = { id: `cl_${Date.now()}`, text: newChecklistItem.trim(), completed: false, };
        setLocalTask(prev => ({ ...prev, checklist: [...(prev.checklist || []), newItem] }));
        setNewChecklistItem('');
    };

    const handleChecklistItemChange = (itemId: string, newText: string) => {
        setLocalTask(prev => ({ 
            ...prev, 
            checklist: (prev.checklist || []).map(item => item.id === itemId ? { ...item, text: newText } : item) 
        }));
    };

    const handleDeleteChecklistItem = (itemId: string) => {
        setLocalTask(prev => ({ 
            ...prev, 
            checklist: (prev.checklist || []).filter(item => item.id !== itemId) 
        }));
    };

    const subtasks = useMemo(() => allTasks.filter(t => t.parentId === task?.id), [allTasks, task]);
    const parentTask = useMemo(() => localTask.parentId ? allTasks.find(t => t.id === localTask.parentId) : null, [localTask.parentId, allTasks]);
    const dependencyTasks = useMemo(() => allTasks.filter(t => (localTask.dependencies || []).includes(t.id)), [localTask.dependencies, allTasks]);
    
    const availableDependencies = useMemo(() => {
        if (!dependencySearch) return [];
        const currentId = 'id' in localTask ? localTask.id : '';
        return allTasks.filter(t => 
            t.id !== currentId && 
            !(localTask.dependencies || []).includes(t.id) && 
            t.name.toLowerCase().includes(dependencySearch.toLowerCase())
        ).slice(0, 5);
    }, [dependencySearch, allTasks, localTask]);

    const handleAddDependency = (depId: string) => {
        setLocalTask(prev => ({ ...prev, dependencies: [...(prev.dependencies || []), depId] }));
        setDependencySearch('');
    };

    const handleRemoveDependency = (depId: string) => {
        setLocalTask(prev => ({ ...prev, dependencies: (prev.dependencies || []).filter(id => id !== depId) }));
    };
    
    const checklistProgress = useMemo(() => {
        const items = localTask.checklist || [];
        if (items.length === 0) return 0;
        return (items.filter(i => i.completed).length / items.length) * 100;
    }, [localTask.checklist]);

    const combinedActivity = useMemo(() => {
        const comments = (localTask.comments || []).map(c => ({ type: 'comment' as const, id: c.id, authorId: c.authorId, text: c.text, timestamp: c.createdAt }));
        const activities = (localTask.activity || []).map(a => ({ type: 'activity' as const, id: a.id, authorId: a.authorId, text: a.action, timestamp: a.timestamp }));
        return [...comments, ...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [localTask]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-card-dark rounded-[2.5rem] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] w-full max-w-6xl h-[90vh] flex flex-col animate-scaleIn overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {/* Modern Header */}
                <header className="flex items-center justify-between p-8 border-b border-white/5 flex-shrink-0 bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                            <Icons.ClipboardListIcon className="w-8 h-8 text-primary-500" />
                        </div>
                        <div>
                            {parentTask && (
                                <button onClick={() => onOpenTask(parentTask)} className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:underline mb-1 flex items-center gap-1">
                                    <Icons.CornerDownRightIcon className="w-3 h-3 rotate-180" /> Parent: {parentTask.name}
                                </button>
                            )}
                            <input 
                                name="name"
                                value={localTask.name}
                                onChange={handleChange}
                                placeholder="Titlu sarcină..."
                                className="text-2xl font-black uppercase tracking-tighter bg-transparent border-none outline-none focus:ring-0 text-white w-full max-w-xl"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {task && (
                            <>
                                <button onClick={() => localTask.isArchived ? onUnarchive(task.id) : onArchive(task.id)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-text-dark-secondary transition-all" title="Arhivare">
                                    <Icons.ArchiveIcon className="w-6 h-6" />
                                </button>
                                <button onClick={handleDelete} className="p-3 bg-red-500/5 hover:bg-red-500/10 rounded-2xl text-red-500 transition-all" title="Ștergere">
                                    <Icons.TrashIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-text-dark-secondary">
                            <Icons.XIcon className="w-8 h-8" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Column: Task Core Content */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-12 border-r border-white/5 no-scrollbar">
                        
                        {/* Status & Priority Row */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-500 opacity-60 block mb-3">Status Operativ</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUSES.map(s => (
                                        <button 
                                            key={s.id} 
                                            onClick={() => setLocalTask({...localTask, status: s.id})}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${localTask.status === s.id ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'}`}
                                        >
                                            {s.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-500 opacity-60 block mb-3">Nivel Prioritate</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRIORITIES.map(p => (
                                        <button 
                                            key={p.id} 
                                            onClick={() => setLocalTask({...localTask, priority: p.id})}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${localTask.priority === p.id ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-white/40 border border-white/5'}`}
                                        >
                                            <p.icon className={`w-3.5 h-3.5 ${localTask.priority === p.id ? 'text-black' : p.color}`} />
                                            {p.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Descriere Detaliată</h4>
                            <textarea 
                                name="description"
                                value={localTask.description}
                                onChange={handleChange}
                                placeholder="Adaugă context, cerințe sau instrucțiuni aici..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white/80"
                            />
                        </section>

                        {/* Subtasks Section */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Sub-sarcini Dependente</h4>
                                <span className="text-[10px] font-black text-white/30 uppercase">{subtasks.length} Entități</span>
                            </div>
                            
                            <div className="space-y-3">
                                {subtasks.map(st => (
                                    <div 
                                        key={st.id} 
                                        onClick={() => onOpenTask(st)}
                                        className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-primary-500/30 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={(e) => handleToggleSubtaskStatus(e, st)}
                                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${st.status === 'completed' ? 'bg-green-500 border-green-500 text-black' : 'border-white/10 hover:border-primary-500'}`}
                                            >
                                                {st.status === 'completed' && <Icons.CheckIcon className="w-4 h-4 font-black" />}
                                            </button>
                                            <span className={`text-sm font-bold tracking-tight uppercase ${st.status === 'completed' ? 'line-through opacity-30 text-white' : 'text-white/80'}`}>{st.name}</span>
                                        </div>
                                        <Icons.ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary-500" />
                                    </div>
                                ))}
                                
                                {task && (
                                    <div className="flex gap-2">
                                        <input 
                                            value={newSubtask}
                                            onChange={e => setNewSubtask(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                                            placeholder="Creează o nouă sub-sarcină..."
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                        <button onClick={handleAddSubtask} className="bg-primary-500 text-black px-6 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-600 transition-all">Adaugă</button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Checklist Section */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Checklist Operativ</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${checklistProgress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-white/30">{Math.round(checklistProgress)}%</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {localTask.checklist?.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 group">
                                        <button 
                                            onClick={() => handleToggleChecklist(item.id)}
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500 text-black' : 'border-white/10'}`}
                                        >
                                            {item.completed && <Icons.CheckIcon className="w-3 h-3" />}
                                        </button>
                                        <input 
                                            value={item.text}
                                            onChange={e => handleChecklistItemChange(item.id, e.target.value)}
                                            className={`flex-1 bg-transparent border-none text-sm font-bold outline-none transition-opacity ${item.completed ? 'opacity-30 line-through' : 'opacity-80'}`}
                                        />
                                        <button onClick={() => handleDeleteChecklistItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500/50 hover:text-red-500 transition-all">
                                            <Icons.XIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="w-5 h-5 flex items-center justify-center opacity-20"><Icons.PlusIcon className="w-4 h-4" /></div>
                                    <input 
                                        value={newChecklistItem}
                                        onChange={e => setNewChecklistItem(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem()}
                                        placeholder="Adaugă un item în listă..."
                                        className="flex-1 bg-transparent border-none text-sm font-bold opacity-40 focus:opacity-100 outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Dependencies Section */}
                        <section className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Blocaje & Dependințe</h4>
                            <div className="flex flex-wrap gap-2">
                                {dependencyTasks.map(dep => (
                                    <div key={dep.id} className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 px-4 py-2 rounded-xl group">
                                        <span className="text-[10px] font-black uppercase tracking-tight text-red-400">{dep.name}</span>
                                        <button onClick={() => handleRemoveDependency(dep.id)} className="text-red-500/40 hover:text-red-400"><Icons.XIcon className="w-3 h-3" /></button>
                                    </div>
                                ))}
                                <div className="relative">
                                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 focus-within:border-primary-500/50 transition-all">
                                        <Icons.SearchIcon className="w-3.5 h-3.5 opacity-40" />
                                        <input 
                                            value={dependencySearch}
                                            onChange={e => setDependencySearch(e.target.value)}
                                            placeholder="Caută blocaj..."
                                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-32"
                                        />
                                    </div>
                                    {availableDependencies.length > 0 && (
                                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-card-dark border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden">
                                            {availableDependencies.map(d => (
                                                <button key={d.id} onClick={() => handleAddDependency(d.id)} className="w-full text-left p-3 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest border-b border-white/5 last:border-0 transition-colors">
                                                    {d.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Metadata, Assignee & Collaboration Feed */}
                    <aside className="w-full md:w-[400px] bg-white/[0.01] flex flex-col no-scrollbar">
                        <div className="p-10 space-y-10 flex-1 overflow-y-auto no-scrollbar">
                            
                            {/* Primary Metadata */}
                            <section className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-4">Responsabil</label>
                                    <select 
                                        name="assigneeId"
                                        value={localTask.assigneeId || 'unassigned'}
                                        onChange={(e) => setLocalTask({...localTask, assigneeId: e.target.value === 'unassigned' ? null : e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 text-white"
                                    >
                                        <option value="unassigned">Fără Responsabil</option>
                                        {allAssignees.filter(a => a.id !== 'unassigned').map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-4">Termen Limită</label>
                                    <input 
                                        type="datetime-local"
                                        name="endDate"
                                        value={format(parseISO(localTask.endDate), "yyyy-MM-dd'T'HH:mm")}
                                        onChange={(e) => setLocalTask({...localTask, endDate: new Date(e.target.value).toISOString()})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 text-white"
                                    />
                                </div>

                                <div className="p-6 bg-primary-500/5 border border-primary-500/10 rounded-[1.5rem] space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={isRecurring}
                                            onChange={(e) => setIsRecurring(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-white/10 bg-black text-primary-500 focus:ring-primary-500"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sarcina Recurentă</span>
                                    </label>
                                    
                                    {isRecurring && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <select 
                                                value={recurrenceRule}
                                                onChange={e => setRecurrenceRule(e.target.value as any)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold"
                                            >
                                                <option value="daily">Zilnic</option>
                                                <option value="weekly">Săptămânal</option>
                                                <option value="monthly">Lunar</option>
                                            </select>
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Expiră pe:</p>
                                                <input 
                                                    type="date"
                                                    value={recurrenceEndDate}
                                                    onChange={e => setRecurrenceEndDate(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Collaboration Feed */}
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Activitate & Feed</h4>
                                <div className="space-y-6">
                                    {combinedActivity.map((act, i) => {
                                        const author = allAssignees.find(a => a.id === act.authorId);
                                        return (
                                            <div key={act.id || i} className="flex gap-4 group">
                                                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] flex-shrink-0 text-primary-500">
                                                    {author?.avatar || act.authorId[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-tight text-white/60">{author?.name || 'Sistem'}</span>
                                                        <span className="text-[9px] font-bold text-white/20">{formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}</span>
                                                    </div>
                                                    <p className={`text-sm leading-relaxed ${act.type === 'comment' ? 'text-white/80 bg-white/[0.02] p-3 rounded-2xl border border-white/5' : 'text-white/40 italic'}`}>
                                                        {act.text}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {combinedActivity.length === 0 && (
                                        <div className="py-10 text-center opacity-20">
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">Nicio activitate încă</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Sticky Comment Input */}
                        {task && (
                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
                                <div className="flex gap-3">
                                    <textarea 
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                                        placeholder="Adaugă un comentariu..."
                                        rows={1}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none overflow-hidden"
                                    />
                                    <button 
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="p-4 bg-primary-500 text-black rounded-2xl font-black shadow-xl hover:bg-primary-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        <Icons.PaperAirplaneIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </aside>
                </main>

                <footer className="p-8 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02] flex-shrink-0">
                    <button onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all rounded-2xl">Renunță</button>
                    <button onClick={handleSave} className="bg-primary-500 text-black px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">Salvează Modificările</button>
                </footer>
            </div>
        </div>
    );
};

export default TaskModal;