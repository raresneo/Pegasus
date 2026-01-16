
import React, { useState, useMemo } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';
import Modal from '../Modal';

// --- TYPES ---
type Tab = 'tags' | 'filters';
type ContextType = 'members' | 'tasks' | 'prospects';

interface TagDef {
    id: string;
    name: string;
    color: string;
}

interface FilterCondition {
    id: string;
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'not';
    value: string;
}

interface SavedFilter {
    id: string;
    name: string;
    context: ContextType;
    conditions: FilterCondition[];
}

// --- CONSTANTS ---
const AVAILABLE_COLORS = [
    'bg-blue-500/20 text-blue-300', 
    'bg-green-500/20 text-green-300', 
    'bg-yellow-500/20 text-yellow-300',
    'bg-red-500/20 text-red-300', 
    'bg-purple-500/20 text-purple-300', 
    'bg-indigo-500/20 text-indigo-300',
    'bg-pink-500/20 text-pink-300', 
    'bg-teal-500/20 text-teal-300',
    'bg-gray-500/20 text-gray-300'
];

const FIELD_OPTIONS: Record<ContextType, string[]> = {
    members: ['Status', 'First Name', 'Last Name', 'Email', 'Join Date', 'Membership Tier', 'Tag'],
    tasks: ['Status', 'Priority', 'Assignee', 'Due Date', 'Tag'],
    prospects: ['Status', 'Last Contacted', 'Name', 'Tag']
};

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not', label: 'Is Not' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
];

// --- MOCK INITIAL DATA (In real app, this comes from DB) ---
const initialTags: TagDef[] = [
    { id: 't1', name: 'Active', color: 'bg-green-500/20 text-green-300' },
    { id: 't2', name: 'Morning Crew', color: 'bg-yellow-500/20 text-yellow-300' },
    { id: 't3', name: 'VIP', color: 'bg-purple-500/20 text-purple-300' },
    { id: 't4', name: 'Student', color: 'bg-blue-500/20 text-blue-300' },
];

const initialFilters: SavedFilter[] = [
    { 
        id: 'f1', 
        name: 'Urgent Admin Tasks', 
        context: 'tasks', 
        conditions: [
            { id: 'c1', field: 'Priority', operator: 'equals', value: 'urgent' },
            { id: 'c2', field: 'Status', operator: 'not', value: 'completed' }
        ]
    },
    { 
        id: 'f2', 
        name: 'New Prospects (This Week)', 
        context: 'prospects', 
        conditions: [
            { id: 'c3', field: 'Status', operator: 'equals', value: 'uncontacted' }
        ] 
    }
];

const FiltersTagsSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('tags');
    
    // --- TAG STATE ---
    const [tags, setTags] = useState<TagDef[]>(initialTags);
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
    const [editingTag, setEditingTag] = useState<TagDef | null>(null);

    // --- FILTER STATE ---
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(initialFilters);
    const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null); // Null means "Create New" mode if form is visible
    const [isFilterFormOpen, setIsFilterFormOpen] = useState(false);
    
    // Form State for Filter
    const [filterName, setFilterName] = useState('');
    const [filterContext, setFilterContext] = useState<ContextType>('members');
    const [conditions, setConditions] = useState<FilterCondition[]>([
        { id: `c_${Date.now()}`, field: 'Status', operator: 'equals', value: '' }
    ]);

    // --- TAG HANDLERS ---
    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;
        const newTag: TagDef = {
            id: `t_${Date.now()}`,
            name: newTagName,
            color: selectedColor
        };
        setTags([...tags, newTag]);
        setNewTagName('');
    };

    const handleUpdateTag = () => {
        if (!editingTag || !newTagName.trim()) return;
        setTags(tags.map(t => t.id === editingTag.id ? { ...t, name: newTagName, color: selectedColor } : t));
        setEditingTag(null);
        setNewTagName('');
        setSelectedColor(AVAILABLE_COLORS[0]);
    };

    const handleDeleteTag = (id: string) => {
        if (window.confirm('Are you sure? This will remove the tag from all associated items.')) {
            setTags(tags.filter(t => t.id !== id));
        }
    };

    const startEditTag = (tag: TagDef) => {
        setEditingTag(tag);
        setNewTagName(tag.name);
        setSelectedColor(tag.color);
    };

    // --- FILTER HANDLERS ---
    const handleAddCondition = () => {
        setConditions([...conditions, { id: `c_${Date.now()}`, field: FIELD_OPTIONS[filterContext][0], operator: 'equals', value: '' }]);
    };

    const handleRemoveCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const handleConditionChange = (id: string, field: keyof FilterCondition, value: string) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const startCreateFilter = () => {
        setEditingFilter(null);
        setFilterName('');
        setFilterContext('members');
        setConditions([{ id: `c_${Date.now()}`, field: 'Status', operator: 'equals', value: '' }]);
        setIsFilterFormOpen(true);
    };

    const startEditFilter = (filter: SavedFilter) => {
        setEditingFilter(filter);
        setFilterName(filter.name);
        setFilterContext(filter.context);
        setConditions(JSON.parse(JSON.stringify(filter.conditions))); // Deep copy
        setIsFilterFormOpen(true);
    };

    const handleSaveFilter = () => {
        if (!filterName.trim()) {
            alert('Please enter a filter name');
            return;
        }

        const newFilter: SavedFilter = {
            id: editingFilter ? editingFilter.id : `f_${Date.now()}`,
            name: filterName,
            context: filterContext,
            conditions: conditions
        };

        if (editingFilter) {
            setSavedFilters(savedFilters.map(f => f.id === editingFilter.id ? newFilter : f));
        } else {
            setSavedFilters([...savedFilters, newFilter]);
        }
        setIsFilterFormOpen(false);
    };

    const handleDeleteFilter = (id: string) => {
        if (window.confirm('Delete this preset?')) {
            setSavedFilters(savedFilters.filter(f => f.id !== id));
            if (editingFilter?.id === id) setIsFilterFormOpen(false);
        }
    };

    // --- RENDERERS ---

    const renderTagsTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-card-dark rounded-lg p-6 border border-border-dark h-fit">
                <h3 className="text-lg font-semibold mb-4">{editingTag ? 'Edit Tag' : 'Create New Tag'}</h3>
                <form onSubmit={editingTag ? (e) => { e.preventDefault(); handleUpdateTag(); } : handleAddTag} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-dark-secondary mb-1">Tag Name</label>
                        <input 
                            type="text" 
                            value={newTagName} 
                            onChange={e => setNewTagName(e.target.value)} 
                            className="w-full p-2 bg-background-dark rounded-md border border-border-dark focus:ring-primary-500"
                            placeholder="e.g., Urgent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-text-dark-secondary mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full ${color} border-2 ${selectedColor === color ? 'border-white' : 'border-transparent hover:border-gray-500'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {editingTag && <button type="button" onClick={() => { setEditingTag(null); setNewTagName(''); }} className="flex-1 py-2 bg-background-dark rounded-md hover:bg-border-dark">Cancel</button>}
                        <button type="submit" className="flex-1 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 font-medium">
                            {editingTag ? 'Update Tag' : 'Create Tag'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="lg:col-span-2 bg-card-dark rounded-lg border border-border-dark overflow-hidden">
                <div className="p-4 border-b border-border-dark bg-background-dark/50">
                    <h3 className="font-semibold">Existing Tags ({tags.length})</h3>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tags.map(tag => (
                        <div key={tag.id} className="flex justify-between items-center p-3 bg-background-dark rounded-md border border-border-dark group">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${tag.color}`}>
                                {tag.name}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditTag(tag)} className="p-1.5 hover:bg-card-dark rounded text-blue-400"><Icons.PencilIcon className="w-4 h-4"/></button>
                                <button onClick={() => handleDeleteTag(tag.id)} className="p-1.5 hover:bg-card-dark rounded text-red-400"><Icons.TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderFiltersTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar List */}
            <div className="lg:col-span-1 space-y-4">
                <button onClick={startCreateFilter} className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 font-medium transition-colors">
                    <Icons.PlusIcon className="w-5 h-5"/> Create New Filter
                </button>
                <div className="bg-card-dark rounded-lg border border-border-dark overflow-hidden">
                    <div className="p-3 border-b border-border-dark bg-background-dark/50">
                        <h3 className="font-semibold text-sm">Saved Presets</h3>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                        {savedFilters.length === 0 ? (
                            <p className="p-4 text-center text-sm text-text-dark-secondary">No saved filters yet.</p>
                        ) : (
                            <ul className="divide-y divide-border-dark">
                                {savedFilters.map(filter => (
                                    <li key={filter.id} className="p-3 hover:bg-background-dark/50 flex justify-between items-center group">
                                        <div onClick={() => startEditFilter(filter)} className="cursor-pointer flex-1">
                                            <p className="font-medium text-text-dark-primary">{filter.name}</p>
                                            <p className="text-xs text-text-dark-secondary capitalize">{filter.context} • {filter.conditions.length} conditions</p>
                                        </div>
                                        <button onClick={() => handleDeleteFilter(filter.id)} className="p-2 opacity-0 group-hover:opacity-100 text-text-dark-secondary hover:text-red-400 transition-opacity">
                                            <Icons.TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Builder Form */}
            <div className="lg:col-span-2">
                {isFilterFormOpen ? (
                    <div className="bg-card-dark rounded-lg border border-border-dark shadow-md animate-fadeIn">
                        <div className="p-6 border-b border-border-dark flex justify-between items-center">
                            <h2 className="text-xl font-bold">{editingFilter ? 'Edit Filter Preset' : 'New Filter Preset'}</h2>
                            <button onClick={() => setIsFilterFormOpen(false)} className="text-text-dark-secondary hover:text-text-dark-primary"><Icons.XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Preset Name</label>
                                    <input 
                                        type="text" 
                                        value={filterName} 
                                        onChange={e => setFilterName(e.target.value)} 
                                        placeholder="e.g. High Priority Tasks"
                                        className="w-full p-2 bg-background-dark rounded-md border border-border-dark"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Applies To</label>
                                    <select 
                                        value={filterContext} 
                                        onChange={e => { setFilterContext(e.target.value as ContextType); setConditions([{id: `c_${Date.now()}`, field: FIELD_OPTIONS[e.target.value as ContextType][0], operator: 'equals', value: ''}]); }}
                                        className="w-full p-2 bg-background-dark rounded-md border border-border-dark capitalize"
                                    >
                                        <option value="members">Members</option>
                                        <option value="tasks">Tasks</option>
                                        <option value="prospects">Prospects</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-text-dark-secondary">Matching Conditions (AND)</label>
                                    <button onClick={handleAddCondition} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                                        <Icons.PlusIcon className="w-3 h-3"/> Add Condition
                                    </button>
                                </div>
                                <div className="space-y-3 bg-background-dark/30 p-4 rounded-lg border border-border-dark">
                                    {conditions.map((condition, index) => (
                                        <div key={condition.id} className="flex gap-2 items-center">
                                            <span className="text-xs text-text-dark-secondary w-6 text-center">{index === 0 ? 'Where' : 'And'}</span>
                                            <select 
                                                value={condition.field}
                                                onChange={e => handleConditionChange(condition.id, 'field', e.target.value)}
                                                className="flex-1 p-2 text-sm bg-card-dark rounded border border-border-dark"
                                            >
                                                {FIELD_OPTIONS[filterContext].map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <select 
                                                value={condition.operator}
                                                onChange={e => handleConditionChange(condition.id, 'operator', e.target.value as any)}
                                                className="w-32 p-2 text-sm bg-card-dark rounded border border-border-dark"
                                            >
                                                {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                                            </select>
                                            <input 
                                                type="text" 
                                                value={condition.value}
                                                onChange={e => handleConditionChange(condition.id, 'value', e.target.value)}
                                                placeholder="Value..."
                                                className="flex-1 p-2 text-sm bg-card-dark rounded border border-border-dark"
                                            />
                                            <button onClick={() => handleRemoveCondition(condition.id)} className="p-2 text-text-dark-secondary hover:text-red-400 disabled:opacity-50" disabled={conditions.length === 1}>
                                                <Icons.TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border-dark flex justify-end gap-3">
                            <button onClick={() => setIsFilterFormOpen(false)} className="px-4 py-2 bg-background-dark rounded-md border border-border-dark hover:bg-border-dark transition-colors">Cancel</button>
                            <button onClick={handleSaveFilter} className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 shadow-md transition-all">
                                {editingFilter ? 'Update Filter' : 'Create Filter'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-dark-secondary border-2 border-dashed border-border-dark rounded-lg p-10">
                        <div className="bg-background-dark p-4 rounded-full mb-4">
                            <Icons.FunnelIcon className="w-12 h-12 text-border-dark" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Select or Create a Filter</h3>
                        <p className="max-w-md text-center">
                            Configure advanced logic to organize your data. Presets created here will be available on their respective pages (Members, Tasks, etc).
                        </p>
                        <button onClick={startCreateFilter} className="mt-6 text-primary-400 font-medium hover:underline">Get Started &rarr;</button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold">Filters & Tags Configuration</h1>
                <p className="text-text-dark-secondary mt-1">
                    Manage how data is labeled and filtered across the application. Create reusable presets to save time.
                </p>
            </div>

            <div className="border-b border-border-dark">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('tags')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'tags'
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-dark-secondary hover:text-text-dark-primary hover:border-border-dark'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Icons.TagIcon className="w-4 h-4" /> Tags Management
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('filters')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'filters'
                                ? 'border-primary-500 text-primary-500'
                                : 'border-transparent text-text-dark-secondary hover:text-text-dark-primary hover:border-border-dark'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Icons.FunnelIcon className="w-4 h-4" /> Filter Presets
                        </div>
                    </button>
                </nav>
            </div>

            <div className="animate-fadeInUp">
                {activeTab === 'tags' ? renderTagsTab() : renderFiltersTab()}
            </div>
        </div>
    );
};

export default FiltersTagsSettings;
