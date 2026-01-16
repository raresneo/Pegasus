
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from '@google/genai';
import { menuItems } from '../lib/menu';
import { MenuItem, Member } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import * as Icons from './icons';

interface GlobalSearchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNavigate: (item: MenuItem) => void;
  onViewMember: (member: Member) => void;
}

type SearchResult = 
    | { type: 'member'; data: Member }
    | { type: 'page'; data: MenuItem };

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, setIsOpen, onNavigate, onViewMember }) => {
    const { members } = useDatabase();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const allNavigableItems = useMemo(() => {
        const flattened: MenuItem[] = [];
        const flatten = (items: MenuItem[], prefix = '') => {
            items.forEach(item => {
                const label = item.label || 'Pagina';
                const newItem = { ...item, label: prefix ? `${prefix} > ${label}` : label };
                if (item.children && item.children.length > 0) {
                    flatten(item.children, newItem.label);
                } else {
                    flattened.push(newItem);
                }
            });
        };
        flatten(menuItems);
        return flattened;
    }, []);

    const searchMembersLocally = useCallback((searchTerm: string) => {
        const lowerTerm = searchTerm.toLowerCase();
        return members
            .filter(m => 
                `${m.firstName} ${m.lastName}`.toLowerCase().includes(lowerTerm) || 
                m.email.toLowerCase().includes(lowerTerm)
            )
            .map(data => ({ type: 'member' as const, data }));
    }, [members]);

    const navigateToLocally = useCallback((searchTerm: string) => {
        const lowerTerm = searchTerm.toLowerCase();
        return allNavigableItems
            .filter(item => item.label.toLowerCase().includes(lowerTerm))
            .map(data => ({ type: 'page' as const, data }));
    }, [allNavigableItems]);

    const runSearch = useCallback(async (currentQuery: string) => {
        if (!currentQuery || currentQuery.length < 2) {
            setResults([]);
            return;
        }

        const localMembers = searchMembersLocally(currentQuery);
        const localPages = navigateToLocally(currentQuery);
        const combinedLocal = [...localMembers, ...localPages];
        
        setResults(combinedLocal);

        // Dacă avem o query care pare o comandă sau o întrebare despre date
        const isActionQuery = currentQuery.split(' ').length > 2 || 
                                     ['vânzări', 'venit', 'raport', 'progres', 'statistici', 'cine', 'cum'].some(k => currentQuery.toLowerCase().includes(k));

        if (isActionQuery && process.env.API_KEY) {
            setIsLoading(true);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const tools: { functionDeclarations: FunctionDeclaration[] } = {
                functionDeclarations: [
                    {
                        name: 'searchMembers',
                        description: 'Căutare membri după nume sau status.',
                        parameters: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['active', 'frozen', 'expired'] },
                            },
                        },
                    },
                    {
                        name: 'navigateTo',
                        description: 'Navigare rapidă către setări sau module.',
                        parameters: {
                            type: Type.OBJECT,
                            properties: {
                                pageId: { type: Type.STRING, description: 'ID-ul scurt al paginii (ex: reports, pos, schedule)' },
                            },
                            required: ['pageId'],
                        },
                    },
                ],
            };

            try {
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: `Utilizatorul caută: "${currentQuery}"`,
                    config: {
                        systemInstruction: "Ești motorul de căutare Pegasus. Rolul tău este să direcționezi utilizatorul către modulul corect. Dacă query-ul sună a raport financiar, du-l la 'reports'. Dacă vrea să vândă ceva, du-l la 'pos'. Dacă vrea un membru specific, caută-l. Dacă vrea setări, du-l la 'settings'.",
                        tools: [{ functionDeclarations: tools.functionDeclarations }],
                    },
                });

                if (response.functionCalls && response.functionCalls.length > 0) {
                    for (const funcCall of response.functionCalls) {
                        if (funcCall.name === 'searchMembers') {
                            const nameArg = (funcCall.args as any)?.name || currentQuery;
                            const aiRes = searchMembersLocally(nameArg);
                            setResults(prev => [...new Map([...prev, ...aiRes].map(item => [item.data.id, item])).values()]);
                        }
                        if (funcCall.name === 'navigateTo') {
                            const pageId = (funcCall.args as any)?.pageId;
                            if (pageId) {
                                const page = allNavigableItems.find(p => p.id === pageId || p.label.toLowerCase().includes(pageId.toLowerCase()));
                                if (page) {
                                    onNavigate(page);
                                    setIsOpen(false);
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("AI Search Error:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [searchMembersLocally, navigateToLocally, allNavigableItems, onNavigate, setIsOpen]);

    useEffect(() => {
        const handler = setTimeout(() => runSearch(query), 300);
        return () => clearTimeout(handler);
    }, [query, runSearch]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex justify-center items-start pt-24 px-4 animate-fadeIn" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-card-dark rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-2xl animate-scaleIn overflow-hidden border border-white/10"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
            <Icons.SearchIcon className="w-6 h-6 text-primary-500 mr-4" />
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută: 'Popescu', 'Vânzări', 'Cât am câștigat azi?'..."
                className="w-full bg-transparent outline-none text-xl font-black tracking-tight text-white placeholder:opacity-30"
            />
            {isLoading && <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>}
        </div>
        <ul className="p-4 max-h-[60vh] overflow-y-auto no-scrollbar space-y-6">
            {results.length > 0 ? (
                <>
                    {results.some(r => r.type === 'member') && (
                        <div>
                            <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Identități Pegasus</p>
                            <div className="space-y-1">
                                {results.filter(r => r.type === 'member').map((r, i) => (
                                    <li key={`mem-${i}`} onClick={() => onViewMember(r.data as Member)} className="flex items-center p-4 rounded-2xl cursor-pointer hover:bg-white/5 group transition-all border border-transparent hover:border-white/5">
                                        <div className="w-12 h-12 bg-primary-900/30 border border-primary-500/20 rounded-xl flex items-center justify-center font-black text-primary-500 mr-4 group-hover:scale-110 transition-transform">
                                            {(r.data as Member).avatar}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-white uppercase tracking-tighter">{(r.data as Member).firstName} {(r.data as Member).lastName}</p>
                                            <p className="text-xs text-white/40 font-bold tracking-widest">{(r.data as Member).email}</p>
                                        </div>
                                        <Icons.ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </li>
                                ))}
                            </div>
                        </div>
                    )}
                    {results.some(r => r.type === 'page') && (
                        <div>
                            <p className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 opacity-60">Module Operative</p>
                            <div className="space-y-1">
                                {results.filter(r => r.type === 'page').map((r, i) => {
                                    const page = r.data as MenuItem;
                                    const Icon = Icons[page.icon as keyof typeof Icons] || Icons.CogIcon;
                                    return (
                                        <li key={`page-${i}`} onClick={() => onNavigate(page)} className="flex items-center p-4 rounded-2xl cursor-pointer hover:bg-white/5 group transition-all border border-transparent hover:border-white/5">
                                            <div className="p-3 bg-white/5 rounded-xl mr-4 group-hover:bg-primary-500/10">
                                                <Icon className="w-5 h-5 text-white/40 group-hover:text-primary-500 transition-colors" />
                                            </div>
                                            <span className="font-black text-white uppercase tracking-widest text-xs">{page.label}</span>
                                        </li>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            ) : query.length >= 2 && !isLoading ? (
                <div className="p-20 text-center flex flex-col items-center opacity-30">
                    <Icons.SearchIcon className="w-12 h-12 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Niciun rezultat pentru "{query}"</p>
                </div>
            ) : (
                <div className="p-10 text-center opacity-20">
                     <p className="text-[10px] font-black uppercase tracking-[0.5em]">Pegasus Indexer v4.0 Active</p>
                </div>
            )}
        </ul>
        <div className="p-5 border-t border-white/5 bg-black/40 flex justify-between items-center px-10">
            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-white/40">
                <span className="flex items-center gap-2"><Icons.CheckIcon className="w-3 h-3 text-primary-500" /> Enter Selectează</span>
                <span className="flex items-center gap-2"><Icons.XIcon className="w-3 h-3 text-primary-500" /> Esc Închide</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary-500 animate-pulse">
                <Icons.SparklesIcon className="w-4 h-4" /> Hybrid Engine
            </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
