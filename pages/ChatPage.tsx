import React, { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ConversationView from '../components/chat/ConversationView';
import { Channel } from '../types';
import * as Icons from '../components/icons';
import { useDatabase } from '../context/DatabaseContext';

const ChatPage: React.FC = () => {
    const { channels } = useDatabase();
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(channels[0]?.id || null);

    const selectedChannel = channels.find(c => c.id === selectedChannelId);

    return (
        <div className="flex h-full -m-4 sm:-m-6 md:-m-8">
            <ChatSidebar 
                channels={channels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={setSelectedChannelId}
            />
            <main className="flex-1 flex flex-col">
                {selectedChannel ? (
                    <ConversationView channel={selectedChannel} key={selectedChannel.id}/>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-text-dark-secondary">
                        <Icons.ChatBubbleLeftEllipsisIcon className="w-16 h-16 mb-4 text-border-dark" />
                        <h2 className="text-xl font-semibold text-text-dark-primary">Welcome to Chat</h2>
                        <p className="mt-2">Select a channel to start a conversation or create a new one.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatPage;
