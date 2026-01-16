
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Channel, Message as MessageType, TaskActivity, Task } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import MessageComposer from './MessageComposer';
import Message from './Message';
import LinkTaskModal from './modals/LinkTaskModal';
import ImportActivityModal from './modals/ImportActivityModal';

interface ConversationViewProps {
    channel: Channel;
}

const ConversationView: React.FC<ConversationViewProps> = ({ channel }) => {
    const { messages, addMessage, linkTaskToChannel, tasks, importActivitiesToChannel, users, activityLogs } = useDatabase();
    const [isLinkTaskModalOpen, setIsLinkTaskModalOpen] = useState(false);
    const [isImportActivityModalOpen, setIsImportActivityModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const channelMessages = messages.filter(m => m.channelId === channel.id);
    const linkedTasks = tasks.filter(t => channel.linkedTaskIds?.includes(t.id));
    
    const allActivitiesForLinkedTasks = useMemo(() => {
        if (linkedTasks.length === 0) return [];
        const taskIds = linkedTasks.map(t => t.id);
        return activityLogs
            .filter(log => taskIds.includes(log.entityId) && log.entityType === 'task')
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [linkedTasks, activityLogs]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [channelMessages]);

    const handleSendMessage = (content: string, media?: { url: string; type: 'image' | 'video' }) => {
        addMessage({ channelId: channel.id, content, mediaUrl: media?.url, mediaType: media?.type });
    };

    const handleLinkTask = (taskId: string) => {
        linkTaskToChannel(channel.id, taskId);
        setIsLinkTaskModalOpen(false);
    };
    
    const handleImportActivities = (activityIds: string[]) => {
        importActivitiesToChannel(channel.id, activityIds);
        setIsImportActivityModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <LinkTaskModal
                isOpen={isLinkTaskModalOpen}
                onClose={() => setIsLinkTaskModalOpen(false)}
                onLink={handleLinkTask}
                tasks={tasks.filter(t => !channel.linkedTaskIds?.includes(t.id))}
            />
            <ImportActivityModal 
                isOpen={isImportActivityModalOpen}
                onClose={() => setIsImportActivityModalOpen(false)}
                activities={allActivitiesForLinkedTasks}
                users={users}
                onImport={handleImportActivities}
            />
            
            <header className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-white/80 dark:bg-card-dark/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-black text-primary-500">#</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-text-light-primary dark:text-text-dark-primary">
                            {channel.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest">
                                {channel.participantIds.length} participanți activi
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {linkedTasks.length > 0 && (
                        <div className="hidden md:flex items-center -space-x-2 mr-4">
                            {linkedTasks.slice(0, 3).map(t => (
                                <div key={t.id} title={`Task: ${t.name}`} className="w-8 h-8 rounded-full bg-card-light dark:bg-background-dark border-2 border-white dark:border-card-dark flex items-center justify-center text-primary-500 shadow-sm">
                                    <Icons.ClipboardCheckIcon className="w-4 h-4" />
                                </div>
                            ))}
                            {linkedTasks.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-border-dark border-2 border-white dark:border-card-dark flex items-center justify-center text-[10px] font-bold">
                                    +{linkedTasks.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                    <button onClick={() => setIsLinkTaskModalOpen(true)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-text-light-secondary dark:text-text-dark-secondary transition-all" title="Link Task">
                        <Icons.LinkIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsImportActivityModalOpen(true)} disabled={linkedTasks.length === 0} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-text-light-secondary dark:text-text-dark-secondary transition-all disabled:opacity-30" title="Import Activity">
                        <Icons.DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {channelMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                        <div className="p-6 bg-gray-100 dark:bg-card-dark rounded-full">
                            <Icons.ChatBubbleLeftEllipsisIcon className="w-12 h-12" />
                        </div>
                        <p className="font-black uppercase tracking-widest text-xs">Începutul conversației în #{channel.name}</p>
                    </div>
                ) : (
                    channelMessages.map((msg, index) => {
                        const isKioskRequest = msg.content.includes('[KIOSK RECEPTIE');
                        return (
                            <div key={msg.id} className={isKioskRequest ? "animate-pulse" : ""}>
                                <Message message={msg} />
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-white dark:bg-card-dark/50">
                <MessageComposer onSendMessage={handleSendMessage} />
                <p className="text-[9px] text-center mt-2 text-text-light-secondary dark:text-text-dark-secondary opacity-40 uppercase font-bold tracking-[0.2em]">
                    Criptare End-to-End Pegasus Active
                </p>
            </div>
        </div>
    );
};

export default ConversationView;
