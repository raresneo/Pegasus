
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import { Task } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';
import { createBlob } from '../../lib/gemini';

const EMOJIS = ['😀', '😂', '😍', '🤔', '😎', '😢', '🎉', '❤️', '👍', '🙏', '🔥', '🚀', '💯', '🙌', '😮', '🤯'];

const EmojiPicker: React.FC<{ onSelect: (emoji: string) => void; onClose: () => void; }> = ({ onSelect, onClose }) => {
    const pickerRef = useRef(null);
    useClickOutside(pickerRef, onClose);
    return (
        <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 p-2 bg-background-dark border border-border-dark rounded-lg shadow-lg z-10">
            <div className="grid grid-cols-4 gap-2">
                {EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => onSelect(emoji)} className="p-2 text-2xl rounded hover:bg-border-dark">{emoji}</button>
                ))}
            </div>
        </div>
    );
};

const GifGenerator: React.FC<{ onSendMedia: (url: string, type: 'video') => void; onClose: () => void; }> = ({ onSendMedia, onClose }) => {
    const pickerRef = useRef(null);
    useClickOutside(pickerRef, onClose);
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKeyError, setApiKeyError] = useState(false);

    useEffect(() => {
        const checkKey = async () => {
            // @ts-ignore
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setHasApiKey(true);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        // @ts-ignore
        if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
            setHasApiKey(true); // Assume success to handle race condition
            setApiKeyError(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt || !hasApiKey) return;
        
        setIsLoading(true);
        setVideoUrl('');
        setApiKeyError(false);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            setLoadingMessage('Warming up the video generator...');
            // FIX: Changed aspect ratio from '1:1' to '16:9' as per Gemini API guidelines for video generation.
            // FIX: Cast operation to any to resolve TypeScript error on unknown properties.
            let operation: any = await ai.models.generateVideos({
              model: 'veo-3.1-fast-generate-preview',
              prompt: `A short, looping, animated GIF-style video of: ${prompt}`,
              config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
              }
            });

            setLoadingMessage('Generating video... this may take a minute.');
            while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
              setLoadingMessage('Still processing... please wait.');
              // FIX: Update operation with typed result from poll.
              operation = await ai.operations.getVideosOperation({operation: operation});
            }

            // FIX: Access error message safely via any cast.
            if (operation.error) {
                throw new Error(operation.error.message);
            }

            setLoadingMessage('Finalizing video...');
            // FIX: Access response fields safely via any cast.
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    if(response.status === 404) throw new Error("Requested entity was not found.");
                    throw new Error(`Failed to download video: ${response.statusText}`);
                }
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setVideoUrl(blobUrl);
            } else {
                 throw new Error('Video generation succeeded but no download link was provided.');
            }

        } catch (e: any) {
            console.error("AI Video Generation Error:", e);
            if (e.message?.includes("Requested entity was not found.")) {
                setApiKeyError(true);
                setHasApiKey(false);
            } else {
                alert(`Sorry, there was an error generating the video: ${e.message}`);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 p-4 bg-background-dark border border-border-dark rounded-lg shadow-lg w-80 z-10">
            <h4 className="text-sm font-bold text-text-dark-secondary mb-2">Generate a GIF-style Video</h4>
            {!hasApiKey ? (
                 <div className="text-center">
                    <p className="text-sm text-text-dark-secondary mb-2">To generate videos, you need to select a Google AI Studio API key.</p>
                    {apiKeyError && <p className="text-sm text-red-400 mb-2">There was an issue with your key. Please select it again.</p>}
                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-primary-400 hover:underline mb-2 block">Billing Information</a>
                    <button onClick={handleSelectKey} className="w-full px-3 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Select API Key</button>
                </div>
            ) : (
                <>
                    <div className="flex gap-2">
                        <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} placeholder="e.g., a cat playing piano" className="flex-1 p-2 bg-card-dark rounded-md border border-border-dark text-sm" />
                        <button onClick={handleGenerate} disabled={isLoading || !prompt} className="px-3 py-1 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-600">{isLoading ? '...' : 'Go'}</button>
                    </div>
                    <div className="h-48 mt-4 bg-card-dark rounded flex flex-col items-center justify-center border border-border-dark p-2">
                        {isLoading && <>
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-text-dark-secondary mt-2">{loadingMessage}</p>
                        </>}
                        {videoUrl && <video src={videoUrl} autoPlay loop muted playsInline className="max-h-full max-w-full object-contain" />}
                        {!isLoading && !videoUrl && <p className="text-xs text-text-dark-secondary">Your video will appear here.</p>}
                    </div>
                    {videoUrl && <button onClick={() => onSendMedia(videoUrl, 'video')} className="w-full mt-4 px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">Send Video</button>}
                </>
            )}
        </div>
    );
};


interface MessageComposerProps {
    onSendMessage: (content: string, media?: { url: string, type: 'image' | 'video' }) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSendMessage }) => {
    const { tasks } = useDatabase();
    const [text, setText] = useState('');
    const [showTaskSuggestions, useStateTaskSuggestions] = useState(false);
    const [taskSearch, setTaskSearch] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isGifGeneratorOpen, setIsGifGeneratorOpen] = useState(false);

    const sessionPromiseRef = useRef<any>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const startTranscription = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Your browser does not support audio recording.");
                return;
            }
            setIsRecording(true);

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, },
                callbacks: {
                    onopen: () => console.log('Mic connection opened'),
                    onclose: () => console.log('Mic connection closed'),
                    onerror: (e) => console.error('Mic connection error:', e),
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const transcribedText = message.serverContent.inputTranscription.text;
                            setText(prev => prev + transcribedText);
                        }
                    },
                },
            });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = audioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromiseRef.current?.then((session: any) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
        } catch (err) {
            console.error("Error starting transcription:", err);
            setIsRecording(false);
        }
    };

    const stopTranscription = useCallback(async () => {
        if (!isRecording) return;
        setIsRecording(false);
        if (sessionPromiseRef.current) {
            try {
              const session = await sessionPromiseRef.current;
              session.close();
            } catch (e) {
              console.debug('Session already closed');
            }
            sessionPromiseRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current) {
            if (audioContextRef.current.state !== 'closed') {
                await audioContextRef.current.close();
            }
            audioContextRef.current = null;
        }
    }, [isRecording]);

    useEffect(() => { return () => { stopTranscription(); } }, [stopTranscription]);

    const handleMicClick = () => { isRecording ? stopTranscription() : startTranscription(); };
    
    useEffect(() => {
        if (text.endsWith('/task')) {
            useStateTaskSuggestions(true);
            setTaskSearch('');
        } else if (showTaskSuggestions && text.includes('/task')) {
            const search = text.split('/task ')[1] || '';
            setTaskSearch(search);
        } else {
            useStateTaskSuggestions(false);
        }
    }, [text, showTaskSuggestions]);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const handleTaskSelect = (task: Task) => {
        const newText = text.replace(/\/task.*$/, `[task:${task.id}] `);
        setText(newText);
        useStateTaskSuggestions(false);
        textareaRef.current?.focus();
    };
    
    const handleSendMedia = (mediaUrl: string, mediaType: 'video' | 'image') => {
        onSendMessage(text, { url: mediaUrl, type: mediaType });
        setText('');
        setIsGifGeneratorOpen(false);
    };

    const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(taskSearch.toLowerCase())).slice(0, 5);

    return (
        <div className="bg-card-dark border border-border-dark rounded-lg p-2 relative">
            {isEmojiPickerOpen && <EmojiPicker onSelect={(emoji) => setText(p => p + emoji)} onClose={() => setIsEmojiPickerOpen(false)} />}
            {isGifGeneratorOpen && <GifGenerator onSendMedia={handleSendMedia} onClose={() => setIsGifGeneratorOpen(false)} />}
            {showTaskSuggestions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-background-dark border border-border-dark rounded-lg shadow-lg">
                    <h4 className="text-xs font-bold text-text-dark-secondary px-2 pb-1">Mention a task...</h4>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <button key={task.id} onClick={() => handleTaskSelect(task)} className="w-full text-left p-2 text-sm rounded hover:bg-primary-500 hover:text-white">
                                {task.name}
                            </button>
                        )) : <p className="p-2 text-sm text-text-dark-secondary">No tasks found.</p>}
                    </div>
                </div>
            )}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? 'Listening...' : "Type a message or use / for commands..."}
                rows={1}
                className="w-full bg-transparent p-2 outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                    <button onClick={handleMicClick} className={`p-2 rounded-full transition-colors text-text-dark-secondary ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-border-dark'}`}>
                      {isRecording ? <Icons.StopCircleIcon className="w-5 h-5" /> : <Icons.MicIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setIsEmojiPickerOpen(p => !p)} className="p-2 rounded-full hover:bg-border-dark text-text-dark-secondary"><Icons.FaceSmileIcon className="w-5 h-5"/></button>
                    <button onClick={() => setIsGifGeneratorOpen(p => !p)} className="p-2 rounded-full hover:bg-border-dark text-text-dark-secondary"><Icons.GifIcon className="w-5 h-5"/></button>
                    <button className="p-2 rounded-full hover:bg-border-dark text-text-dark-secondary"><Icons.PaperclipIcon className="w-5 h-5"/></button>
                </div>
                 <button onClick={handleSend} disabled={!text.trim()} className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-500">
                    <Icons.PaperAirplaneIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MessageComposer;
