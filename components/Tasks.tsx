
import React, { useState, useMemo, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskStatus, TaskPriority, Member, User, Prospect, RecurrenceRule } from '../types';
import * as Icons from './icons';
import { mockUsers } from '../lib/data';
// FIX: Corrected imports from date-fns, removing incorrect alias for startOfMonth and adding subMonths.
import { isToday, isTomorrow, isPast, parseISO, addDays, startOfToday, endOfMonth, isWithinInterval, startOfMonth, addMonths, subMonths } from 'date-fns';
import { GoogleGenAI, Type } from '@google/genai';

import TaskFilters from './tasks/TaskFilters';
import BoardView from './tasks/BoardView';
import TasksListView from './tasks/TasksListView';
import CalendarView from './tasks/CalendarView';
import TaskModal from './tasks/TaskModal';
import RecurringEditModal from './RecurringEditModal';

// --- TYPE DEFINITIONS ---
export type ViewType = 'board' | 'list' | 'calendar';
export type GroupByType = 'status' | 'assignee' | 'priority' | 'none';
export type SortByType = 'priority' | 'endDate' | 'name';
export type Assignee = { id: string; name: string; avatar: string; type: 'Client' | 'Trainer' | 'Prospect' | 'Unassigned' };

export const STATUSES: { id: TaskStatus; title: string; color: string; icon: React.FC<any> }[] = [
    { id: 'todo', title: 'De făcut', color: 'gray', icon: Icons.ClipboardListIcon },
    { id: 'in_progress', title: 'În lucru', color: 'blue', icon: Icons.ClockIcon },
    { id: 'pending', title: 'În așteptare', color: 'yellow', icon: Icons.EllipsisHorizontalIcon },
    { id: 'completed', title: 'Finalizat', color: 'green', icon: Icons.CheckCircleIcon },
];

export const PRIORITIES: { id: TaskPriority; title: string; color: string; icon: React.FC<any> }[] = [
    { id: 'low', title: 'Scăzută', color: 'text-gray-400', icon: Icons.FlagIcon },
    { id: 'medium', title: 'Medie', color: 'text-blue-400', icon: Icons.FlagIcon },
    { id: 'high', title: 'Ridicată', color: 'text-yellow-400', icon: Icons.FlagIcon },
    { id: 'urgent', title: 'Urgent', color: 'text-red-500', icon: Icons.FireIcon },
];

// --- HELPERS ---
const expandRecurringTasks = (tasks: Task[], viewStartDate: Date, viewEndDate: Date): Task[] => {
    const instances: Task[] = [];
    const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

    tasks.forEach(task => {
        if (task.recurrence && task.id) {
            const recurrenceEndDate = new Date(task.recurrence.endDate);
            let current = new Date(task.endDate);
            const exceptionDates = (task.recurrence.exceptionDates || []).map(d => toYYYYMMDD(new Date(d)));

            // Find first occurrence in view or after series start
            while (current <= recurrenceEndDate && current < viewEndDate) {
                if (current >= viewStartDate && !exceptionDates.includes(toYYYYMMDD(current))) {
                    instances.push({
                        ...task,
                        id: `${task.id}_${current.toISOString()}`,
                        seriesId: task.id,
                        endDate: current.toISOString(),
                        recurrence: undefined, // Instance doesn't recur itself
                    });
                }

                switch (task.recurrence!.rule) {
                    case 'daily': current.setDate(current.getDate() + 1); break;
                    case 'weekly': current.setDate(current.getDate() + 7); break;
                    case 'monthly': current.setMonth(current.getMonth() + 1); break;
                }
            }
        } else {
            const taskEndDate = new Date(task.endDate);
            if (taskEndDate >= viewStartDate && taskEndDate < viewEndDate) {
                instances.push(task);
            }
        }
    });
    return instances;
};

// --- MyBrain AI Modal ---
type AISuggestion = {
    memberName: string;
    memberId: string;
    suggestedTaskTitle: string;
    suggestedTaskDescription: string;
    suggestedDueDate?: string;
    actionType: 'CREATE_TASK' | 'CONVERT_TO_PROSPECT';
};

const MyBrainModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    members: Member[];
    onOpenNewTask: (initialData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
    convertToProspect: (memberId: string) => void;
}> = ({ isOpen, onClose, members, onOpenNewTask, convertToProspect }) => {
    const [aiState, setAiState] = useState<'idle' | 'analyzing' | 'results' | 'error'>('idle');
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [processedSuggestions, setProcessedSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && aiState === 'idle') {
            handleMyBrainAnalyze();
        } else if (!isOpen) {
            setAiState('idle');
        }
    }, [isOpen]);

    const handleMyBrainAnalyze = async () => {
        setAiState('analyzing');
        setProcessedSuggestions([]);

        const churnedMembers = members.filter(m => ['expired', 'cancelled'].includes(m.membership.status));
        const churnedMembersSummary = churnedMembers.map(m => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`,
            membershipEndDate: m.membership.endDate,
            lastCommunication: m.communications?.[m.communications.length - 1]?.date || 'none',
        })).slice(0, 10);

        if (churnedMembersSummary.length === 0) {
            setAiSuggestions([]);
            setAiState('results');
            return;
        }

        const prompt = `Ești un asistent inteligent pentru Fitable. Analizează acești membri care au părăsit clubul și sugerează sarcini de re-engagement.
        Date: ${JSON.stringify(churnedMembersSummary, null, 2)}
        Răspunde sub formă de array JSON.`;

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    memberName: { type: Type.STRING },
                    memberId: { type: Type.STRING },
                    suggestedTaskTitle: { type: Type.STRING },
                    suggestedTaskDescription: { type: Type.STRING },
                    suggestedDueDate: { type: Type.STRING },
                    actionType: { type: Type.STRING, enum: ['CREATE_TASK', 'CONVERT_TO_PROSPECT'] }
                },
                required: ['memberId', 'suggestedTaskTitle', 'actionType']
            }
        };

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                },
            });

            const suggestions: AISuggestion[] = JSON.parse(response.text);
            setAiSuggestions(suggestions);
            setAiState('results');
        } catch (e) {
            console.error("MyBrain AI Error:", e);
            setAiState('error');
        }
    };

    const handleAction = (suggestion: AISuggestion) => {
        if (suggestion.actionType === 'CREATE_TASK') {
            onOpenNewTask({
                name: suggestion.suggestedTaskTitle,
                description: suggestion.suggestedTaskDescription,
                assigneeId: 'u1',
                status: 'todo',
                priority: 'medium',
                endDate: suggestion.suggestedDueDate || addDays(new Date(), 3).toISOString()
            });
            onClose();
        } else if (suggestion.actionType === 'CONVERT_TO_PROSPECT') {
            convertToProspect(suggestion.memberId);
        }
        setProcessedSuggestions(prev => [...prev, suggestion.memberId]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-card-dark rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-border-dark flex-shrink-0">
                    <div className="flex items-center gap-2"><Icons.SparklesIcon className="w-6 h-6 text-purple-400" /><h3 className="text-lg font-bold text-text-dark-primary">MyBrain AI Assistant</h3></div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-background-dark"><Icons.XIcon className="w-5 h-5" /></button>
                </header>
                <main className="p-6 flex-1 overflow-y-auto">
                    {aiState === 'analyzing' && <div className="text-center p-10"><p>Se analizează baza de date pentru oportunități...</p></div>}
                    {aiState === 'error' && <div className="text-center p-10 text-red-400"><p>Eroare la procesare. Încercați din nou.</p></div>}
                    {aiState === 'results' && (
                        <div className="space-y-4">
                            {aiSuggestions.length === 0 ? (
                                <p className="text-center text-text-dark-secondary">Nu am găsit acțiuni urgente în acest moment.</p>
                            ) : (
                                aiSuggestions.map(s => {
                                    const isProcessed = processedSuggestions.includes(s.memberId);
                                    return (
                                        <div key={s.memberId} className={`p-4 rounded-lg border ${isProcessed ? 'bg-background-dark/50' : 'bg-background-dark'} border-border-dark`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold">{s.suggestedTaskTitle}</p>
                                                    <p className="text-sm text-text-dark-secondary">{s.suggestedTaskDescription}</p>
                                                </div>
                                                <button onClick={() => handleAction(s)} disabled={isProcessed} className="px-3 py-1 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                                    {isProcessed ? 'Gata' : s.actionType === 'CREATE_TASK' ? 'Creează Sarcină' : 'Convertește'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const Tasks: React.FC = () => {
    const { members, prospects, addCommentToTask, toggleTaskChecklistItem, addSubtask, convertToProspect } = useDatabase();
    const { tasks, addTask: apiAddTask, updateTask: apiUpdateTask, deleteTask: apiDeleteTask, archiveTask: apiArchiveTask, unarchiveTask: apiUnarchiveTask, loading: tasksLoading } = useTasks(true);

    const [view, setView] = useState<ViewType>('list');
    const [groupBy, setGroupBy] = useState<GroupByType>('status');
    const [sortBy, setSortBy] = useState<SortByType>('priority');
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{ assignees: string[], priorities: TaskPriority[], statuses: TaskStatus[], showArchived: boolean }>({ assignees: [], priorities: [], statuses: [], showArchived: false });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [modalInitialData, setModalInitialData] = useState<Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> | null>(null);
    const [isMyBrainOpen, setIsMyBrainOpen] = useState(false);

    // Recurring Logic
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [recurringAction, setRecurringAction] = useState<'save' | 'delete'>('save');

    const allAssignees = useMemo<Assignee[]>(() => {
        const clientAssignees: Assignee[] = members.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, avatar: m.avatar, type: 'Client' }));
        const trainerAssignees: Assignee[] = mockUsers.filter(u => u.role === 'trainer' || u.role === 'admin').map(u => ({ id: u.id, name: u.name, avatar: u.avatar, type: 'Trainer' }));
        const prospectAssignees: Assignee[] = prospects.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, type: 'Prospect' }));
        return [{ id: 'unassigned', name: 'Nealocat', avatar: '?', type: 'Unassigned' }, ...clientAssignees, ...trainerAssignees, ...prospectAssignees];
    }, [members, prospects]);

    const expandedTasks = useMemo(() => {
        // We expand for the current month +/- 1 month to keep it responsive
        const now = new Date();
        const startRange = startOfMonth(subMonths(now, 1));
        const endRange = endOfMonth(addMonths(now, 1));
        return expandRecurringTasks(tasks, startRange, endRange);
    }, [tasks]);

    const filteredAndSortedTasks = useMemo(() => {
        let processedTasks = [...expandedTasks];

        processedTasks = processedTasks.filter(task => {
            if (task.isArchived && !filters.showArchived) return false;
            if (!task.isArchived && filters.showArchived) return false;

            const searchMatch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
            const assigneeMatch = filters.assignees.length === 0 || filters.assignees.includes(task.assigneeId || 'unassigned');
            const priorityMatch = filters.priorities.length === 0 || filters.priorities.includes(task.priority);
            const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(task.status);
            return searchMatch && assigneeMatch && priorityMatch && statusMatch;
        });

        processedTasks.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            }
            if (sortBy === 'endDate') {
                return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
            }
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            }
            return 0;
        });

        return processedTasks;
    }, [expandedTasks, searchTerm, filters, sortBy]);

    const handleOpenTaskModal = (task: Task | null, initialData?: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
        // If clicking an instance, we actually want to edit the series or the exception
        if (task?.seriesId) {
            const seriesTask = tasks.find(t => t.id === task.seriesId);
            setSelectedTask(seriesTask || task);
        } else {
            setSelectedTask(task);
        }

        if (initialData) {
            setModalInitialData(initialData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
        setModalInitialData(null);
        setTaskToEdit(null); // Clear pending task data
    };

    const handleOpenTaskFromModal = (taskToOpen: Task) => {
        setSelectedTask(taskToOpen);
        setModalInitialData(null);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
        try {
            if ('id' in taskData) {
                // Edit mode
                const originalTask = tasks.find(t => t.id === (taskData.seriesId || taskData.id));
                if (originalTask?.recurrence && (taskData.id !== originalTask.id || (taskData as any).isException)) {
                    setTaskToEdit(taskData as Task);
                    setRecurringAction('save');
                    setIsRecurringModalOpen(true);
                    return;
                }
                await apiUpdateTask(taskData as Task);
            } else {
                // Create mode
                await apiAddTask(taskData);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const taskToDelete = tasks.find(t => t.id === taskId);
        if (taskToDelete?.recurrence) {
            setTaskToEdit(taskToDelete);
            setRecurringAction('delete');
            setIsRecurringModalOpen(true);
        } else {
            await apiDeleteTask(taskId);
            handleCloseModal();
        }
    };

    const handleRecurringConfirm = async (scope: 'one' | 'future' | 'all') => {
        if (taskToEdit) {
            if (recurringAction === 'save') {
                await apiUpdateTask(taskToEdit, scope);
            } else {
                await apiDeleteTask(taskToEdit.id, scope);
            }
        }
        setIsRecurringModalOpen(false);
        setTaskToEdit(null);
        handleCloseModal();
    };

    const renderView = () => {
        const props = {
            tasks: filteredAndSortedTasks,
            allAssignees,
            onTaskClick: (task: Task) => handleOpenTaskModal(task),
            onTaskUpdate: (t: Task) => handleSaveTask(t),
            allTasks: expandedTasks,
        };
        switch (view) {
            case 'board':
                return <BoardView {...props} groupBy={groupBy} onNewTask={(task, status) => handleOpenTaskModal(null, { status })} />;
            case 'list':
                return <TasksListView {...props} updateTask={(t) => handleSaveTask(t)} />;
            case 'calendar':
                return <CalendarView {...props} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full -m-4 sm:-m-6 md:-m-8">
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
                onArchive={apiArchiveTask}
                onUnarchive={apiUnarchiveTask}
                onAddComment={addCommentToTask}
                onToggleChecklist={toggleTaskChecklistItem}
                onAddSubtask={addSubtask}
                task={selectedTask}
                allTasks={tasks}
                allAssignees={allAssignees}
                initialData={modalInitialData}
                onOpenTask={handleOpenTaskFromModal}
            />
            <MyBrainModal
                isOpen={isMyBrainOpen}
                onClose={() => setIsMyBrainOpen(false)}
                members={members}
                onOpenNewTask={(data) => handleOpenTaskModal(null, data)}
                convertToProspect={convertToProspect}
            />
            <RecurringEditModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                onConfirm={handleRecurringConfirm}
                action={recurringAction}
            />

            <header className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary">Sarcini</h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary mt-1">Gestionează fluxul de lucru al echipei tale.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMyBrainOpen(true)} className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-700 text-sm font-medium">
                            <Icons.SparklesIcon className="w-5 h-5 mr-2" />
                            MyBrain AI
                        </button>
                        <button onClick={() => handleOpenTaskModal(null, { status: 'todo' })} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-600 text-sm font-medium">
                            <Icons.PlusIcon className="w-5 h-5 mr-2" />
                            Sarcină Nouă
                        </button>
                    </div>
                </div>

                <TaskFilters
                    view={view}
                    onViewChange={setView}
                    groupBy={groupBy}
                    onGroupByChange={setGroupBy}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onFiltersChange={setFilters}
                    allAssignees={allAssignees}
                />
            </header>

            <main className="flex-1 overflow-auto px-4 sm:px-6 md:px-8">
                {renderView()}
            </main>
        </div>
    );
};

export default Tasks;
