
import React, { useState, useMemo } from 'react';
import * as Icons from '../components/icons';
import { kpiData, reportCategories, predefinedReports } from '../lib/reports-data';
import { useDatabase } from '../context/DatabaseContext';
import { format, parseISO, isToday } from 'date-fns';
import InteractiveChart from '../components/reports/InteractiveChart';

const KPIWidget: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease'; icon: React.FC<any>; onClick?: () => void; }> = ({ title, value, change, changeType, icon: Icon, onClick }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
    
    const content = (
         <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gray-100 dark:bg-background-dark rounded-2xl border border-white/5">
                    <Icon className={`w-6 h-6 ${changeColor}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-widest ${isIncrease ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isIncrease ? '↑' : '↓'} {change}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-light-secondary dark:text-text-dark-secondary opacity-60 mb-1">{title}</p>
                <p className="text-3xl font-black text-text-light-primary dark:text-text-dark-primary tracking-tighter leading-none">{value}</p>
            </div>
        </div>
    );

    const baseClasses = "glass-card p-8 rounded-[2.5rem] shadow-sm border border-white/5 transition-all duration-500 relative overflow-hidden group h-full";

    if (onClick) {
        return (
            <button onClick={onClick} className={`${baseClasses} text-left hover:-translate-y-2 hover:border-primary-500/50 hover:shadow-2xl`}>
                <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                {content}
            </button>
        );
    }
    
    return <div className={baseClasses}>{content}</div>;
};

const ReportCard: React.FC<{ report: typeof predefinedReports[0]; onClick: () => void; }> = ({ report, onClick }) => (
    <div onClick={onClick} className="glass-card p-6 rounded-[2rem] border border-white/5 cursor-pointer transition-all duration-300 hover:border-primary-500 hover:shadow-xl group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-primary-500/10 transition-colors">
                <Icons.DocumentTextIcon className="w-5 h-5 text-primary-500" />
            </div>
            {report.isFavorite && <Icons.StarIcon className="w-5 h-5 text-yellow-400 fill-current" />}
        </div>
        <h4 className="font-black text-sm uppercase tracking-tight text-text-light-primary dark:text-text-dark-primary group-hover:text-primary-500 transition-colors">{report.name}</h4>
        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-2 line-clamp-2 leading-relaxed opacity-60">{report.description}</p>
    </div>
);

const ReportsPage: React.FC = () => {
    const { members, payments } = useDatabase();
    const [activeCategory, setActiveCategory] = useState(reportCategories[0].id);
    const [selectedReport, setSelectedReport] = useState<typeof predefinedReports[0] | null>(null);
    
    const mockRevenueData = [
        { label: 'IAN', value: 4500 }, { label: 'FEB', value: 5200 }, { label: 'MAR', value: 4800 },
        { label: 'APR', value: 6100 }, { label: 'MAI', value: 5900 }, { label: 'IUN', value: 7500 },
        { label: 'IUL', value: 9258 }
    ];

    const mockAttendanceData = [
        { label: 'LUN', value: 120 }, { label: 'MAR', value: 95 }, { label: 'MIE', value: 110 },
        { label: 'JOI', value: 85 }, { label: 'VIN', value: 140 }, { label: 'SAM', value: 60 },
        { label: 'DUM', value: 45 }
    ];

    const reportsForCategory = useMemo(() => {
        return predefinedReports.filter(r => r.category === activeCategory);
    }, [activeCategory]);

    const reportTableData = useMemo(() => {
        if (!selectedReport) return { columns: [], rows: [] };

        switch(selectedReport.id) {
            case 'mem_01':
                return {
                    columns: ['Client', 'Plan', 'Expirare', 'Status'],
                    rows: members.map(m => [
                        `${m.firstName} ${m.lastName}`,
                        m.membership.tierId.toUpperCase(),
                        format(parseISO(m.membership.endDate), 'dd MMM yyyy'),
                        m.membership.status.toUpperCase()
                    ])
                };
            case 'fin_01':
                return {
                    columns: ['Data/Ora', 'ID Tranzacție', 'Sumă', 'Metodă'],
                    rows: payments.map(p => [
                        format(parseISO(p.date), 'dd MMM HH:mm'),
                        p.id.split('_').pop()?.toUpperCase() || 'TXN',
                        `${p.amount.toFixed(2)} RON`,
                        p.method?.toUpperCase() || 'CARD'
                    ])
                };
            default:
                return {
                    columns: ['Informație', 'Status'],
                    rows: [['Date în curs de indexare...', 'PENDING']]
                };
        }
    }, [selectedReport, members, payments]);

    const renderDashboard = () => (
        <div className="space-y-12 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIWidget title="Venit Total (MTD)" value={kpiData.totalRevenue.value} change={kpiData.totalRevenue.change} changeType={kpiData.totalRevenue.changeType} icon={Icons.CurrencyDollarIcon} onClick={() => setActiveCategory('financial')} />
                <KPIWidget title="Înrolări Noi" value={members.filter(m => isToday(parseISO(m.joinDate))).length.toString()} change={kpiData.newMembers.change} changeType={kpiData.newMembers.changeType} icon={Icons.UserAddIcon} onClick={() => setActiveCategory('member')} />
                <KPIWidget title="Membri Valizi" value={members.filter(m => m.membership.status === 'active').length.toString()} change={kpiData.activeMembers.change} changeType={kpiData.activeMembers.changeType} icon={Icons.UsersIcon} onClick={() => setActiveCategory('member')} />
                <KPIWidget title="Churn Rate (Analytic)" value={kpiData.churnRate.value} change={kpiData.churnRate.change} changeType={kpiData.churnRate.changeType} icon={Icons.ArrowTrendingUpIcon} onClick={() => setActiveCategory('retention')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-500 mb-2">Revenue Streams</h3>
                            <p className="text-2xl font-black text-white uppercase tracking-tighter italic">Proiecție Lunară</p>
                        </div>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">+12.4% vs prev</span>
                    </div>
                    <InteractiveChart data={mockRevenueData} color="#D4AF37" height={250} type="line" />
                </div>
                
                <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-500 mb-2">Member Engagement</h3>
                            <p className="text-2xl font-black text-white uppercase tracking-tighter italic">Trafic Săptămânal</p>
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Avg. 110 vizitatori/zi</span>
                    </div>
                    <InteractiveChart data={mockAttendanceData} color="#8B5CF6" height={250} type="bar" />
                </div>
            </div>

            <section className="space-y-6">
                <h3 className="text-xl font-black uppercase tracking-tighter border-l-4 border-primary-500 pl-4">Rapoarte Favorite</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {predefinedReports.filter(r => r.isFavorite).map(report => (
                        <ReportCard key={report.id} report={report} onClick={() => setSelectedReport(report)} />
                    ))}
                </div>
            </section>
        </div>
    );

    const renderReportDetail = () => (
        <div className="space-y-10 animate-fadeIn">
            <button 
                onClick={() => setSelectedReport(null)}
                className="text-primary-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
            >
                <Icons.ChevronLeftIcon className="w-4 h-4" /> Înapoi la Centru
            </button>
            
            <header className="flex justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{selectedReport?.name}</h1>
                    <p className="text-white/40 mt-4 font-bold text-lg tracking-tight">{selectedReport?.description}</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5">
                        <Icons.DownloadIcon className="w-6 h-6" />
                    </button>
                    <button className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5">
                        <Icons.PrinterIcon className="w-6 h-6" />
                    </button>
                    <button className="bg-primary-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20">Generare PDF</button>
                </div>
            </header>

            <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                {reportTableData.columns.map((col, i) => (
                                    <th key={i} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {reportTableData.rows.map((row, ri) => (
                                <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                                    {row.map((cell, ci) => (
                                        <td key={ci} className="px-8 py-5 text-sm font-bold text-white/80">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 px-4 max-w-7xl mx-auto">
            {selectedReport ? renderReportDetail() : (
                <>
                    <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
                        <div className="flex-1">
                            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none italic">BI Hub Explorer</h1>
                            <p className="text-white/40 mt-4 font-bold text-lg tracking-tight">Instrument de decizie bazat pe datele Pegasus Core.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
                                <Icons.DownloadIcon className="w-5 h-5" /> Export Global
                            </button>
                            <button className="bg-primary-500 text-black px-8 py-4 rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all font-black flex items-center gap-3 active:scale-95">
                                <Icons.ChartBarIcon className="w-6 h-6" /> Builder Raport
                            </button>
                        </div>
                    </header>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar Criterii */}
                        <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
                             <div className="bg-card-dark rounded-3xl border border-white/10 p-2 overflow-hidden">
                                {reportCategories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${activeCategory === cat.id ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <cat.icon className="w-5 h-5" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">{cat.name}</span>
                                    </button>
                                ))}
                             </div>

                             <div className="p-8 bg-accent-600/10 rounded-3xl border border-accent-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Icons.SparklesIcon className="w-10 h-10 text-accent-500" /></div>
                                <h4 className="text-sm font-black uppercase tracking-tighter text-accent-400 italic">Predicție MyBrain™</h4>
                                <p className="text-xs text-white/50 mt-2 font-medium leading-relaxed">Bazat pe trendurile lunii curente, estimăm un venit final de 12.450 RON (↑ 8%).</p>
                             </div>
                        </aside>

                        {/* Main Reports Area */}
                        <div className="flex-1">
                            {activeCategory === 'dashboard' ? renderDashboard() : (
                                <div className="space-y-10 animate-fadeIn">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-primary-500 pl-4">
                                        Rapoarte {reportCategories.find(c => c.id === activeCategory)?.name}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {reportsForCategory.map(r => (
                                            <ReportCard key={r.id} report={r} onClick={() => setSelectedReport(r)} />
                                        ))}
                                    </div>
                                    {reportsForCategory.length === 0 && (
                                        <div className="py-32 text-center opacity-20">
                                            <Icons.DocumentTextIcon className="w-16 h-16 mx-auto mb-4" />
                                            <p className="font-black uppercase tracking-widest text-xs">Niciun raport disponibil în această secțiune.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportsPage;
