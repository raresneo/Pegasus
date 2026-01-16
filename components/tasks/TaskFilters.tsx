
import React, { useState, useRef } from 'react';
import { ViewType, GroupByType, SortByType, Assignee, PRIORITIES, STATUSES } from '../Tasks';
import { TaskPriority, TaskStatus } from '../../types';
import * as Icons from '../icons';
import { useClickOutside } from '../../hooks/useClickOutside';

interface TaskFiltersProps {
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    groupBy: GroupByType;
    onGroupByChange: (group: GroupByType) => void;
    sortBy: SortByType;
    onSortByChange: (sort: SortByType) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    filters: { assignees: string[], priorities: TaskPriority[], statuses: TaskStatus[], showArchived: boolean };
    onFiltersChange: (filters: TaskFiltersProps['filters']) => void;
    allAssignees: Assignee[];
}

const FilterDropdown: React.FC<Pick<TaskFiltersProps, 'filters' | 'onFiltersChange' | 'allAssignees'>> = ({ filters, onFiltersChange, allAssignees }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    const handleToggle = (key: 'assignees' | 'priorities' | 'statuses', value: string) => {
        const current = filters[key];
        // FIX: Cast current to any[] to avoid "never" type error when calling includes on a union of arrays with different element types (string[] | TaskPriority[] | TaskStatus[]).
        const newValues = (current as any[]).includes(value) 
            ? (current as any[]).filter(v => v !== value) 
            : [...current, value];
        onFiltersChange({ ...filters, [key]: newValues });
    };
    
    const activeFilterCount = filters.assignees.length + filters.priorities.length + filters.statuses.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-card-dark text-text-dark-primary border border-border-dark hover:bg-border-dark">
                <Icons.FunnelIcon className="w-4 h-4" /> Filter
                {activeFilterCount > 0 && <span className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">{activeFilterCount}</span>}
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-72 bg-card-dark border border-border-dark rounded-lg shadow-lg z-20 p-4">
                    <h4 className="font-semibold text-sm mb-2">Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {STATUSES.map(s => (
                            <label key={s.id} className="flex items-center text-sm gap-2 cursor-pointer">
                                <input type="checkbox" checked={filters.statuses.includes(s.id)} onChange={() => handleToggle('statuses', s.id)} className="h-4 w-4 rounded text-primary-500 bg-background-dark border-border-dark" />
                                <span className="capitalize">{s.title}</span>
                            </label>
                        ))}
                    </div>
                    <h4 className="font-semibold text-sm mb-2 mt-4">Priority</h4>
                    <div className="space-y-1">
                        {PRIORITIES.map(p => (
                            <label key={p.id} className="flex items-center text-sm gap-2 cursor-pointer">
                                <input type="checkbox" checked={filters.priorities.includes(p.id)} onChange={() => handleToggle('priorities', p.id)} className="h-4 w-4 rounded text-primary-500 bg-background-dark border-border-dark" />
                                <p.icon className={`w-4 h-4 ${p.color}`} /> <span className="capitalize">{p.title}</span>
                            </label>
                        ))}
                    </div>
                    <h4 className="font-semibold text-sm mb-2 mt-4">Assignee</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {allAssignees.map(a => (
                            <label key={a.id} className="flex items-center text-sm gap-2 cursor-pointer p-1 rounded hover:bg-background-dark">
                                <input type="checkbox" checked={filters.assignees.includes(a.id)} onChange={() => handleToggle('assignees', a.id)} className="h-4 w-4 rounded text-primary-500 bg-background-dark border-border-dark" />
                                {a.name}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const TaskFilters: React.FC<TaskFiltersProps> = (props) => {
    const { view, onViewChange, groupBy, onGroupByChange, sortBy, onSortByChange, searchTerm, onSearchChange, filters, onFiltersChange } = props;

    const handleArchivedToggle = () => {
        onFiltersChange({ ...filters, showArchived: !filters.showArchived });
    };

    return (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Left side: Search & Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow">
                    <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                    <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 p-2 w-full sm:w-64 bg-card-dark rounded-md border border-border-dark focus:ring-1 focus:ring-primary-500" />
                </div>
                <FilterDropdown {...props} />
            </div>

            {/* Right side: View & Grouping controls */}
            <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 text-sm text-text-dark-secondary cursor-pointer">
                    <input type="checkbox" checked={filters.showArchived} onChange={handleArchivedToggle} className="h-4 w-4 rounded text-primary-500 bg-background-dark border-border-dark" />
                    Show Archived
                </label>
                {view === 'board' && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-text-dark-secondary">Group by:</span>
                        <select value={groupBy} onChange={e => onGroupByChange(e.target.value as GroupByType)} className="p-2 bg-card-dark rounded-md border border-border-dark">
                            <option value="status">Status</option>
                            <option value="assignee">Assignee</option>
                            <option value="priority">Priority</option>
                        </select>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-dark-secondary">Sort by:</span>
                     <select value={sortBy} onChange={e => onSortByChange(e.target.value as SortByType)} className="p-2 bg-card-dark rounded-md border border-border-dark">
                        <option value="priority">Priority</option>
                        <option value="endDate">Due Date</option>
                        <option value="name">Name</option>
                    </select>
                </div>

                <div className="flex items-center bg-card-dark rounded-md p-1 border border-border-dark">
                    {(['board', 'list', 'calendar'] as ViewType[]).map(v => (
                        <button key={v} onClick={() => onViewChange(v)} className={`p-1.5 rounded ${view === v ? 'bg-background-dark shadow-sm' : ''}`}>
                            {v === 'board' && <Icons.ViewGridIcon className="w-5 h-5" />}
                            {v === 'list' && <Icons.ViewListIcon className="w-5 h-5" />}
                            {v === 'calendar' && <Icons.CalendarIcon className="w-5 h-5" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskFilters;
