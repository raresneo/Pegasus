
import React, { useState } from 'react';
import { Channel } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import CreateChannelModal from './modals/CreateChannelModal';

interface ChatSidebarProps {
    channels: Channel[];
    selectedChannelId: string | null;
    onSelectChannel: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ channels, selectedChannelId, onSelectChannel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // FIX: Changed mockUsers to users to match the DatabaseContextType property name.
    const { addChannel, users } = useDatabase();

    const handleCreateChannel = (name: string, type: 'public' | 'private', participantIds: string[]) => {
        addChannel({ name, type, participantIds });
        setIsModalOpen(false);
    };

    return (
        <>
            <CreateChannelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateChannel}
                users={users}
            />
            <aside className="w-72 bg-sidebar-dark flex-shrink-0 border-r border-border-dark flex flex-col">
                <header className="p-4 border-b border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold">Channels</h2>
                    <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-md hover:bg-border-dark text-text-dark-secondary">
                        <Icons.PlusIcon className="w-5 h-5" />
                    </button>
                </header>
                <div className="p-2">
                     <div className="relative">
                        <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                        <input type="text" placeholder="Search channels..." className="pl-10 p-2 w-full bg-background-dark rounded-md text-sm border border-border-dark" />
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-2">
                    <ul>
                        {channels.map(channel => {
                            const isActive = channel.id === selectedChannelId;
                            return (
                                <li key={channel.id}>
                                    <button
                                        onClick={() => onSelectChannel(channel.id)}
                                        className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors ${isActive ? 'bg-primary-500/20 text-text-dark-primary font-semibold' : 'text-text-dark-secondary hover:bg-border-dark/50'}`}
                                    >
                                        <span className="text-lg">#</span>
                                        <span className="truncate">{channel.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default ChatSidebar;
