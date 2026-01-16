import React, { useState } from 'react';
import FormModal from '../../FormModal';
import { Task } from '../../../types';
import * as Icons from '../../icons';

interface LinkTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLink: (taskId: string) => void;
    tasks: Task[];
}

const LinkTaskModal: React.FC<LinkTaskModalProps> = ({ isOpen, onClose, onLink, tasks }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Link a Task to this Channel">
            <div className="relative mb-4">
                <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                <input
                    type="text"
                    placeholder="Search for a task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 p-2 w-full bg-background-dark rounded-md border border-border-dark"
                />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
                {filteredTasks.map(task => (
                    <button
                        key={task.id}
                        onClick={() => onLink(task.id)}
                        className="w-full text-left p-3 rounded-md bg-background-dark hover:bg-border-dark flex justify-between items-center"
                    >
                        <span>{task.name}</span>
                        <span className="text-xs text-text-dark-secondary capitalize">{task.status.replace('_', ' ')}</span>
                    </button>
                ))}
            </div>
             <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
            </div>
        </FormModal>
    );
};

export default LinkTaskModal;
