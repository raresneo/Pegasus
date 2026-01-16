import React, { useState, DragEvent, useMemo } from 'react';
import { Prospect } from '../types';
import * as Icons from '../components/icons';
import { useDatabase } from '../context/DatabaseContext';
import AddProspectModal from '../components/AddProspectModal';

const ProspectCard: React.FC<{ prospect: Prospect; onDragStart: (e: DragEvent<HTMLDivElement>, prospect: Prospect) => void; }> = ({ prospect, onDragStart }) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, prospect)}
            className="bg-card-dark p-4 rounded-lg shadow-sm mb-4 cursor-grab active:cursor-grabbing border border-border-dark transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center font-bold text-primary-200 mr-3">
                        {prospect.avatar}
                    </div>
                    <span className="font-semibold text-text-dark-primary">{prospect.name}</span>
                </div>
                <button className="text-text-light-secondary hover:text-text-dark-primary">
                    <Icons.DotsVerticalIcon />
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
                {prospect.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs font-medium bg-background-dark text-text-dark-secondary rounded-full">{tag}</span>
                ))}
            </div>
            <div className="text-xs text-text-dark-secondary">
                <p>Last contacted: {prospect.lastContacted}</p>
                <p>Assigned to: {prospect.assignedTo}</p>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{
    title: string;
    prospects: Prospect[];
    columnId: Prospect['status'];
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDrop: (e: DragEvent<HTMLDivElement>, columnId: Prospect['status']) => void;
    onDragStart: (e: DragEvent<HTMLDivElement>, prospect: Prospect) => void;
    isDraggingOver: boolean;
    onDragEnter: () => void;
    onDragLeave: () => void;
}> = ({ title, prospects, columnId, onDragOver, onDrop, onDragStart, isDraggingOver, onDragEnter, onDragLeave }) => {
    return (
        <div
            className={`bg-background-dark rounded-lg w-72 p-2 flex-shrink-0 transition-colors duration-200 ${isDraggingOver ? 'bg-primary-900/30' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, columnId)}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
        >
            <h3 className="font-bold text-text-dark-primary p-2 mb-2">{title} ({prospects.length})</h3>
            <div className="h-full overflow-y-auto pr-1">
                {prospects.map(prospect => (
                    <ProspectCard key={prospect.id} prospect={prospect} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

const ProspectsPage: React.FC = () => {
    const { prospects, updateProspect } = useDatabase();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<Prospect['status'][]>([]);
    const [tagFilters, setTagFilters] = useState<string[]>([]);
    const [draggingOverColumn, setDraggingOverColumn] = useState<Prospect['status'] | null>(null);
    const [isAddProspectModalOpen, setIsAddProspectModalOpen] = useState(false);

    const handleStatusFilterChange = (status: Prospect['status']) => {
        setStatusFilters(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleTagFilterChange = (tag: string) => {
        setTagFilters(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        prospects.forEach(p => p.tags.forEach(tag => tags.add(tag)));
        return Array.from(tags).sort();
    }, [prospects]);

    const filteredProspects = useMemo(() => {
        return prospects.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
            const matchesTags = tagFilters.length === 0 || tagFilters.every(tag => p.tags.includes(tag));
            return matchesSearch && matchesStatus && matchesTags;
        });
    }, [prospects, searchTerm, statusFilters, tagFilters]);

    const columns = useMemo(() => {
        return {
            uncontacted: filteredProspects.filter(p => p.status === 'uncontacted'),
            contacted: filteredProspects.filter(p => p.status === 'contacted'),
            trial: filteredProspects.filter(p => p.status === 'trial'),
            won: filteredProspects.filter(p => p.status === 'won'),
        };
    }, [filteredProspects]);

    const handleDragStart = (e: DragEvent<HTMLDivElement>, prospect: Prospect) => {
        e.dataTransfer.setData('prospectId', prospect.id);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>, targetStatus: Prospect['status']) => {
        e.preventDefault();
        setDraggingOverColumn(null);
        const prospectId = e.dataTransfer.getData('prospectId');
        const prospectToMove = prospects.find(p => p.id === prospectId);

        if (prospectToMove && prospectToMove.status !== targetStatus) {
            updateProspect({ ...prospectToMove, status: targetStatus });
        }
    };

    const prospectStatuses: Prospect['status'][] = ['uncontacted', 'contacted', 'trial', 'won'];

    return (
        <>
            <AddProspectModal
                isOpen={isAddProspectModalOpen}
                onClose={() => setIsAddProspectModalOpen(false)}
            />

            <div className="flex h-full -m-4 sm:-m-6 md:-m-8">
                {/* Left Sidebar */}
                <aside className="w-64 bg-card-dark p-4 hidden md:block flex-shrink-0">
                    <h2 className="text-lg font-bold mb-4">Prospects</h2>
                    <div className="relative mb-4">
                        <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 p-2 w-full bg-background-dark rounded-md"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddProspectModalOpen(true)}
                        className="w-full bg-primary-500 text-white p-2 rounded-md hover:bg-primary-600 mb-6"
                    >
                        Add Prospect
                    </button>
                    <h3 className="font-semibold text-sm mb-2">Filters by Status</h3>
                    <div className="space-y-2">
                        {prospectStatuses.map(status => (
                            <label key={status} className="flex items-center p-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={statusFilters.includes(status)}
                                    onChange={() => handleStatusFilterChange(status)}
                                    className="h-4 w-4 rounded border-border-dark bg-background-dark text-primary-500 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm capitalize text-text-dark-secondary">{status}</span>
                            </label>
                        ))}
                    </div>
                    <h3 className="font-semibold text-sm mb-2 mt-6">Filters by Tag</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {allTags.map(tag => (
                            <label key={tag} className="flex items-center p-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tagFilters.includes(tag)}
                                    onChange={() => handleTagFilterChange(tag)}
                                    className="h-4 w-4 rounded border-border-dark bg-background-dark text-primary-500 focus:ring-primary-500"
                                />
                                <span className="ml-2 text-sm capitalize text-text-dark-secondary">{tag}</span>
                            </label>
                        ))}
                    </div>
                    <div className="h-32 bg-background-dark rounded-md flex items-center justify-center my-6">
                        <p className="text-text-dark-secondary text-sm">Prospect Funnel Chart</p>
                    </div>
                </aside>

                {/* Kanban Board */}
                <main className="flex-1 flex flex-col p-4">
                    <div className="flex items-center justify-between mb-4 md:hidden">
                        <h1 className="text-xl font-bold">Prospects</h1>
                        <button
                            onClick={() => setIsAddProspectModalOpen(true)}
                            className="bg-primary-500 text-white p-2 rounded-md hover:bg-primary-600"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                        <KanbanColumn
                            title="Uncontacted"
                            columnId="uncontacted"
                            prospects={columns.uncontacted}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragStart={handleDragStart}
                            isDraggingOver={draggingOverColumn === 'uncontacted'}
                            onDragEnter={() => setDraggingOverColumn('uncontacted')}
                            onDragLeave={() => setDraggingOverColumn(null)}
                        />
                        <KanbanColumn
                            title="Contacted"
                            columnId="contacted"
                            prospects={columns.contacted}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragStart={handleDragStart}
                            isDraggingOver={draggingOverColumn === 'contacted'}
                            onDragEnter={() => setDraggingOverColumn('contacted')}
                            onDragLeave={() => setDraggingOverColumn(null)}
                        />
                        <KanbanColumn
                            title="Trial"
                            columnId="trial"
                            prospects={columns.trial}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragStart={handleDragStart}
                            isDraggingOver={draggingOverColumn === 'trial'}
                            onDragEnter={() => setDraggingOverColumn('trial')}
                            onDragLeave={() => setDraggingOverColumn(null)}
                        />
                        <KanbanColumn
                            title="Won"
                            columnId="won"
                            prospects={columns.won}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragStart={handleDragStart}
                            isDraggingOver={draggingOverColumn === 'won'}
                            onDragEnter={() => setDraggingOverColumn('won')}
                            onDragLeave={() => setDraggingOverColumn(null)}
                        />
                    </div>
                </main>
            </div>
        </>
    );
};

export default ProspectsPage;