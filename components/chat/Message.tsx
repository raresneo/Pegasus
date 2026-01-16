
import React from 'react';
import { Message as MessageType } from '../../types';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import TaskReference from './TaskReference';
import ActivityReference from './ActivityReference';
import * as Icons from '../icons';

interface MessageProps {
    message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    const { users } = useDatabase();
    const { user: currentUser } = useAuth();
    const author = users.find(u => u.id === message.authorId);
    const isMe = currentUser?.id === message.authorId;
    const isKioskHelp = message.content.includes('[KIOSK RECEPTIE');

    // Regex to find [type:id] references
    const referenceRegex = /\[(task|activity):([^\]]+)\]/g;

    const renderContent = (content: string) => {
        const parts = content.split(referenceRegex);
        const renderedParts = [];
        for (let i = 0; i < parts.length; i += 3) {
            if (parts[i]) {
                renderedParts.push(<span key={`text-${i}`}>{parts[i]}</span>);
            }
            if (parts[i+1] && parts[i+2]) {
                const type = parts[i+1];
                const id = parts[i+2];
                if (type === 'task') {
                    renderedParts.push(<TaskReference key={`task-${id}-${i}`} taskId={id} />);
                } else if (type === 'activity') {
                    const [taskId, activityId] = id.split('/');
                    renderedParts.push(<ActivityReference key={`activity-${id}-${i}`} activityId={activityId} taskId={taskId} />);
                }
            }
        }
        return renderedParts;
    };

    if (isKioskHelp) {
        return (
            <div className="flex justify-center my-4 animate-fadeInUp">
                <div className="bg-red-500/10 border-2 border-red-500/30 p-6 rounded-[2rem] max-w-xl w-full shadow-xl shadow-red-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Icons.FireIcon className="w-20 h-20 text-red-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-red-500 text-white rounded-2xl animate-pulse shadow-lg shadow-red-500/40">
                            <Icons.ChatAltIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black uppercase tracking-tighter text-red-600 dark:text-red-400">Solicitare Ajutor Kiosk</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60">Terminal Recepție • {format(new Date(message.createdAt), 'HH:mm')}</p>
                        </div>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl italic text-sm font-bold text-text-light-primary dark:text-white border border-red-500/20 mb-4">
                        "{message.content.replace(/\[KIOSK RECEPTIE - SOLICITARE AJUTOR\]: /g, '')}"
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">Intervin Acum</button>
                        <button className="px-4 py-2 bg-white dark:bg-card-dark rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">Ignoră</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-3 animate-fadeIn ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm flex-shrink-0 ${isMe ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-card-dark text-text-light-secondary dark:text-primary-400 border border-border-light dark:border-border-dark'}`}>
                {author?.avatar || '?'}
            </div>
            
            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <span className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary mb-1 ml-1">{author?.name}</span>}
                
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isMe 
                    ? 'bg-primary-500 text-white rounded-br-none shadow-primary-500/10' 
                    : 'bg-white dark:bg-card-dark text-text-light-primary dark:text-text-dark-primary rounded-bl-none border border-border-light dark:border-border-dark'
                }`}>
                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {renderContent(message.content)}
                    </div>
                    
                    {message.mediaUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-black/5 dark:border-white/5">
                            {message.mediaType === 'image' ? (
                                <img src={message.mediaUrl} alt="User content" className="max-w-xs hover:scale-105 transition-transform" />
                            ) : (
                                <video src={message.mediaUrl} autoPlay loop muted playsInline className="max-w-xs" />
                            )}
                        </div>
                    )}
                </div>
                
                <div className={`flex items-center gap-2 mt-1 px-1 opacity-40 hover:opacity-100 transition-opacity`}>
                    <span className="text-[9px] font-bold uppercase tracking-tighter" title={format(new Date(message.createdAt), 'PPpp')}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                    {isMe && <Icons.CheckIcon className="w-3 h-3 text-primary-500" />}
                </div>
            </div>
        </div>
    );
};

export default Message;
