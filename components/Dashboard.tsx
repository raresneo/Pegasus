
import React, { useMemo, memo, useState, useRef, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import * as Icons from './icons';
import { MenuItem } from '../types';
import { parseISO, startOfMonth, isWithinInterval, startOfToday, subDays, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { enUS, ro } from 'date-fns/locale';
import DonutChart from './DonutChart';
import { findMenuItemById } from '../lib/utils';
import { menuItems } from '../lib/menu';
import ActivityStream from './ActivityStream';
import { useLanguage } from '../context/LanguageContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface DashboardProps {
    onNavigate: (item: MenuItem, context?: any) => void;
}

const KpiCard = memo(({ title, value, change, changeType, icon: Icon, color, onClick, specialClass = "" }: any) => {
    const isIncrease = changeType === 'increase';
    
    return (
        <div onClick={onClick} className={`glass-card p-8 rounded-[2.5rem] transition-all duration-500 cursor-pointer group relative overflow-hidden border-border-dark ${specialClass}`}>
            <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-20">
                <div className={`p-4 rounded-2xl bg-black/40 border border-white/20 group-hover:border-primary-500/50 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.2)] transition-all duration-500`}>
                    <Icon className={`w-7 h-7 ${color}`} />
                </div>
                {change && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${isIncrease ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} shadow-xl`}>
                        {isIncrease ? '↑' : '↓'} {change}
                    </div>
                )}
            </div>
            
            <div className="relative z-20">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary-500 transition-colors duration-500 mb-2">{title}</p>
                <p className="text-4xl font-black text-white tracking-tighter leading-none text-high-contrast">{value}</p>
            </div>
        </div>
    );
});

const SystemHealth = ({ onNavigate }: { onNavigate: (item: MenuItem) => void }) => {
    const [uptime, setUptime] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const handleGoToAudit = () => {
        const item = findMenuItemById(menuItems, 'settings-technical');
        if (item) onNavigate(item);
    };

    return (
        <div onClick={handleGoToAudit} className="glass-card p-10 rounded-[3.5rem] border border-white/5 space-y-10 relative overflow-hidden cursor-pointer group">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-500 mb-2">Core Health</h3>
                    <p className="text-xl font-black text-white uppercase tracking-tighter italic">System Integrity</p>
                </div>
                <div className="bg-primary-500 text-black px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest animate-pulse">Stable</div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>AI Node Latency</span>
                        <span className="text-primary-500">24ms</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 w-[15%] rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>Database Node Sync</span>
                        <span className="text-green-500">100%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full rounded-full shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Session Uptime</p>
                    <p className="font-black text-sm tabular-nums text-white">{formatUptime(uptime)}</p>
                </div>
                <div>
                    <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1 text-right">View Audit Log &rarr;</p>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { members, payments, products, currentLocationId, locations } = useDatabase();
    const { t, language } = useLanguage();
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const actionMenuRef = useRef(null);
    const dateLocale = language === 'ro' ? ro : enUS;

    useClickOutside(actionMenuRef, () => setIsActionMenuOpen(false));
    
    const stats = useMemo(() => {
        const today = startOfToday();
        const startCurrMonth = startOfMonth(today);
        const revenueCurr = payments.filter(p => p.amount > 0 && isWithinInterval(parseISO(p.date), { start: startCurrMonth, end: today })).reduce((sum, p) => sum + p.amount, 0);
        
        const lowStockCount = products.filter(p => p.stock <= p.reorderPoint).length;
        const atRiskMembers = members.filter(m => (m.healthScore || 0) < 40).length;
        const activeMembers = members.filter(m => m.membership.status === 'active').length;

        const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
        const visitHistoryData = last7Days.map(day => ({
            label: format(day, 'EEE', { locale: dateLocale }),
            value: members.reduce((sum, m) => sum + (m.visitHistory?.filter(v => isSameDay(parseISO(v.date), day)).length || 0), 0)
        }));

        const membershipData = [
            { label: language === 'ro' ? 'Activi' : 'Active', value: activeMembers, color: '#D4AF37' },
            { label: language === 'ro' ? 'Risc' : 'Risk', value: atRiskMembers, color: '#8B5CF6' },
            { label: language === 'ro' ? 'Inactiv' : 'Idle', value: Math.max(0, members.length - activeMembers - atRiskMembers), color: '#334155' }
        ];

        return { revenueCurr, atRiskMembers, lowStockCount, activeMembers, visitHistoryData, membershipData };
    }, [members, payments, products, language, dateLocale]);

    const handleNavigateTo = (pageId: string, context?: any) => {
        const item = findMenuItemById(menuItems, pageId);
        if (item) onNavigate(item, context);
        setIsActionMenuOpen(false);
    };

    return (
        <div className="space-y-12 pb-32 animate-fade-in-up">
            <header className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-white/10 pb-12">
                 <div className="flex-1">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-3 h-3 rounded-full bg-primary-500 shadow-[0_0_15px_rgba(212,175,55,1)] animate-pulse"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-500">Elite Hub Ecosystem • Chain Node Alpha</span>
                     </div>
                     <h1 className="text-7xl font-black tracking-tighter uppercase text-white leading-none italic text-high-contrast">{t('dash.title')}</h1>
                     <p className="subtext-contrast mt-5 font-bold text-lg tracking-tight flex items-center gap-3">
                        {t('dash.subtitle')} 
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                        <span className="text-accent-500 font-black uppercase tracking-widest text-sm">{currentLocationId === 'all' ? 'Arhitectură Globală' : locations.find(l => l.id === currentLocationId)?.name}</span>
                     </p>
                </div>
                <div className="flex gap-4 relative" ref={actionMenuRef}>
                    <button 
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                        className="bg-primary-500 text-black px-10 py-5 rounded-[1.75rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        {t('dash.actions')} <Icons.ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 ${isActionMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isActionMenuOpen && (
                        <div className="absolute top-full right-0 mt-4 w-72 bg-card-dark border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-scaleIn">
                            <ul className="p-3 space-y-1">
                                <li onClick={() => handleNavigateTo('terminal')} className="flex items-center gap-4 p-5 hover:bg-white/5 rounded-2xl cursor-pointer group">
                                    <Icons.IdentificationIcon className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('dash.action.checkin')}</span>
                                </li>
                                <li onClick={() => handleNavigateTo('pos')} className="flex items-center gap-4 p-5 hover:bg-white/5 rounded-2xl cursor-pointer group">
                                    <Icons.ShoppingCartIcon className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('dash.action.sale')}</span>
                                </li>
                                <li onClick={() => handleNavigateTo('members-hub')} className="flex items-center gap-4 p-5 hover:bg-white/5 rounded-2xl cursor-pointer group">
                                    <Icons.UserAddIcon className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('dash.action.member')}</span>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('dash.revenue')} value={`${stats.revenueCurr.toLocaleString()} RON`} change="12%" changeType="increase" icon={Icons.CurrencyDollarIcon} color="text-green-500" onClick={() => handleNavigateTo('reports')} />
                <KpiCard title={t('dash.churn')} value={stats.atRiskMembers} change="4.2%" changeType="decrease" icon={Icons.ArrowTrendingUpIcon} color="text-red-500" onClick={() => handleNavigateTo('reports')} />
                <KpiCard title={t('dash.stock')} value={stats.lowStockCount} icon={Icons.ArchiveIcon} color="text-orange-500" onClick={() => handleNavigateTo('pos')} />
                <KpiCard title={t('dash.community')} value={stats.activeMembers} change="8.1%" changeType="increase" icon={Icons.UsersIcon} color="text-primary-500" onClick={() => handleNavigateTo('members-hub')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <div className="glass-card p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Icons.ChartBarIcon className="w-64 h-64 text-white" /></div>
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-[10px] font-black text-text-dark-secondary uppercase tracking-[0.5em] mb-2">{t('dash.traffic')}</h3>
                                <p className="text-xl font-black text-white uppercase tracking-tighter italic">Vizite Săptămânale</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between h-48 gap-3">
                            {stats.visitHistoryData.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                    <div className="w-full relative bg-white/5 rounded-2xl overflow-hidden" style={{ height: '100%' }}>
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-primary-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover/bar:bg-primary-400" 
                                            style={{ height: `${(day.value / 20) * 100}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover/bar:text-primary-500">{day.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <DonutChartSection title={t('dash.status')} data={stats.membershipData} onNavigate={onNavigate} />
                        <SystemHealth onNavigate={onNavigate} />
                    </div>
                </div>

                <div className="lg:col-span-1 h-full">
                    <ActivityStream onNavigate={onNavigate} />
                </div>
            </div>
            
            <div className="p-12 bg-accent-600 rounded-[3.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                 <div className="absolute inset-0 gold-shimmer opacity-10 pointer-events-none"></div>
                 <div className="flex items-center gap-8 relative z-10">
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-700">
                        <Icons.SparklesIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight italic">{t('dash.ai_engine')}</h3>
                        <p className="text-white/70 font-medium text-sm max-w-md mt-1 leading-relaxed">{t('dash.ai_desc')}</p>
                    </div>
                 </div>
                 <button onClick={() => handleNavigateTo('reports')} className="relative z-10 px-10 py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-white hover:text-black transition-all duration-500 active:scale-95 border border-white/10">Analiză Heuristică &rarr;</button>
            </div>
        </div>
    );
};

const DonutChartSection = ({ title, data, onNavigate }: any) => (
    <div onClick={() => { const item = findMenuItemById(menuItems, 'members-hub'); if(item) onNavigate(item); }} className="glass-card p-10 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-between shadow-2xl group cursor-pointer">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-light-secondary dark:text-text-dark-secondary mb-10 text-center">{title}</h3>
        <div className="scale-110 group-hover:scale-125 transition-transform duration-1000">
            <DonutChart data={data} />
        </div>
        <div className="h-4"></div>
    </div>
);

export default Dashboard;
