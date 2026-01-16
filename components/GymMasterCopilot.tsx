
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, GenerateContentResponse, FunctionDeclaration } from '@google/genai';
import { ChatAltIcon, XIcon, MicIcon, PaperAirplaneIcon, StopCircleIcon, SparklesIcon, CreditCardIcon, CheckCircleIcon, ShieldCheckIcon } from './icons';
import { createBlob } from '../lib/gemini';
import { useCopilot } from '../context/CopilotContext';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import StripePaymentModal from './StripePaymentModal';

interface FitableCopilotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
    paymentRequest?: {
        amount: number;
        description: string;
        memberId: string;
    };
    isSuccess?: boolean;
}

const FitableCopilot: React.FC<FitableCopilotProps> = ({ isOpen, setIsOpen }) => {
  const { actions } = useCopilot();
  const { members, purchaseMembership } = useDatabase();
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
      { 
        role: 'model', 
        text: language === 'ro' 
          ? 'Salutare! Sunt Pegasus AI, nucleul tău de inteligență operațională. Cu ce te pot asista azi?' 
          : 'Hello! I am Pegasus AI, your operational intelligence core. How can I assist you today?' 
      }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [stripeModalData, setStripeModalData] = useState<{ amount: number; description: string; memberId: string } | null>(null);

  const sessionPromiseRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const startTranscription = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Eroare acces microfon.");
        return;
      }
      setIsRecording(true);
      setInputText('');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => console.log('AI Voice Active'),
          onclose: () => console.log('AI Voice Closed'),
          onerror: (e) => console.error('Error:', e),
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setInputText(prev => prev + text);
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
      console.error("Eroare acces microfon:", err);
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

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    
    stopTranscription();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const stripePaymentTool: FunctionDeclaration = {
            name: 'requestStripePayment',
            description: 'Initiates a Stripe payment request for plans or products.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    amount: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    memberName: { type: Type.STRING }
                },
                required: ['amount', 'description', 'memberName']
            }
        };

        const functionDeclarations = [
            ...actions.map(a => a.functionDeclaration),
            stripePaymentTool
        ];
        
        const systemPrompt = language === 'ro' 
          ? "Ești Pegasus AI, sistemul de management core pentru business-uri bazate pe active și servicii. Vorbește elegant, tehnic și profesional. Ești capabil să procesezi plăți și să gestionezi programări."
          : "You are Pegasus AI, the core management system for asset and service-based businesses. Speak elegantly, technically and professionally. You can process payments and manage bookings.";

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: text,
            config: {
                systemInstruction: systemPrompt,
                tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined,
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            for (const funcCall of response.functionCalls) {
                if (funcCall.name === 'requestStripePayment') {
                    const { amount, description, memberName } = funcCall.args as any;
                    const member = members.find(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberName.toLowerCase()));
                    
                    if (member) {
                        setMessages(prev => [...prev, { 
                            role: 'model', 
                            text: language === 'ro' 
                              ? `Sunt pregătit să procesez tranzacția pentru "${description}". Finalizează link-ul securizat.` 
                              : `I am ready to process the transaction for "${description}". Please complete the secure link below.`,
                            paymentRequest: { amount, description, memberId: member.id }
                        }]);
                    } else {
                        setMessages(prev => [...prev, { role: 'model', text: language === 'ro' ? `Client negăsit: ${memberName}.` : `Could not find client: ${memberName}.` }]);
                    }
                    continue;
                }

                const action = actions.find(a => a.functionDeclaration.name === funcCall.name);
                if (action) {
                    const result = await action.handler(funcCall.args);
                    setMessages(prev => [...prev, { role: 'model', text: result.message }]);
                }
            }
        } else {
            setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
        }

    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI core." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-accent text-white p-5 rounded-[2.5rem] shadow-2xl hover:scale-110 transition-all z-40 violet-glow border border-white/20"
      >
        <SparklesIcon className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex justify-center items-end sm:items-center animate-fadeIn p-4">
          <div className="bg-card-dark border border-primary-500/20 rounded-[3rem] shadow-[0_0_50px_rgba(124,58,237,0.2)] w-full max-w-lg h-[85vh] flex flex-col animate-scaleIn overflow-hidden">
            <header className="flex items-center justify-between p-8 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent text-white rounded-xl">
                    <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-accent">Pegasus AI</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dark-secondary">{language === 'ro' ? 'Nucleu Activ' : 'Core Active'}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-text-dark-secondary">
                <XIcon className="w-6 h-6" />
              </button>
            </header>

            <main ref={chatBodyRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fadeInUp`}>
                  <div className={`max-w-[85%] px-5 py-4 rounded-[1.8rem] ${
                    msg.role === 'user' 
                      ? 'bg-primary-500 text-black font-bold rounded-br-none shadow-lg shadow-primary-500/10' 
                      : 'bg-white/5 text-text-dark-primary rounded-bl-none border border-white/10'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && <div className="w-4 h-4 bg-accent rounded-full animate-pulse"></div>}
            </main>

            <footer className="p-8 border-t border-white/5">
              <div className="flex gap-3 items-center">
                <button 
                  onClick={isRecording ? stopTranscription : startTranscription}
                  className={`p-4 rounded-2xl transition-all shadow-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-text-dark-secondary'}`}
                >
                  {isRecording ? <StopCircleIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
                </button>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={language === 'ro' ? "Cu ce vă pot ajuta azi?" : "How can I help you today?"}
                    className="flex-1 bg-white/5 border border-white/10 rounded-[1.5rem] py-4 px-6 text-sm outline-none text-text-dark-primary"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="p-4 bg-accent text-white rounded-2xl font-black shadow-xl hover:bg-accent-light active:scale-95 transition-all"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default FitableCopilot;
