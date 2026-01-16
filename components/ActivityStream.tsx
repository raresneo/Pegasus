
import React, { memo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import * as Icons from './icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { MenuItem } from '../types';
import { findMenuItemById } from '../lib/utils';
import { menuItems } from '../lib/menu';

const LogEntry = memo(({ log, user, isAI }: any) => (
    <div className="relative pl-14 pb-10 group">
      <div className="absolute left-[21px] top-12 bottom-0 w-0.5 bg-white/5 group-last:hidden"></div>
      <div className={`absolute left-0 top-0 w-11 h-11 rounded-[1rem] bg-card-dark border transition-all duration-500 z-10 group-hover:scale-110 shadow-2xl ${isAI ? 'border-accent-500/50 text-accent-500 shadow-accent-500/10' : 'border-white/10 text-primary-500 group-hover:border-primary-500/40'} flex items-center justify-center`}>
        {isAI ? <Icons.SparklesIcon className="w-5 h-5" /> : <span className="text-[11px] font-black uppercase tracking-tight">{user?.avatar || 'S'}</span>}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${isAI ? 'bg-accent-500' : 'bg-primary-500'} animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]`}></div>
      </div>
      <div className="pt-1 transition-all duration-300 group-hover:translate-x-1">
        <p className="text-[13px] font-bold text-text-dark-primary leading-relaxed line-clamp-2 group-hover:text-primary-400 transition-colors">
          {log.details}
        </p>
        <div className="flex items-center gap-3 mt-2.5 opacity-40 group-hover:opacity-100 transition-all duration-500">
           <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isAI ? 'text-accent-400' : 'text-primary-400'}`}>
             {user?.name || 'Pegas Node'}
           </span>
           <span className="w-1 h-1 bg-white/20 rounded-full"></span>
           <span className="text-[9px] font-bold text-text-dark-secondary uppercase tracking-widest">
             {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true, locale: ro })}
           </span>
        </div>
      </div>
    </div>
));

const ActivityStream: React.FC<{ onNavigate?: (item: MenuItem) => void }> = ({ onNavigate }) => {
  const { activityLogs, users } = useDatabase();

  const sortedLogs = React.useMemo(() => [...activityLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 8), [activityLogs]);

  const goToLog = () => {
      if (onNavigate) {
          // Navighează direct la Jurnalul Audit în secțiunea tehnică
          const item = findMenuItemById(menuItems, 'settings-technical');
          if (item) onNavigate(item);
      }
  };

  return (
    <div className="glass-card p-10 rounded-[3.5rem] h-full flex flex-col shadow-2xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 gold-shimmer opacity-20"></div>
      <div className="flex justify-between items-start mb-14 flex-shrink-0">
        <div className="space-y-2">
            <h3 className="text-[10px] font-black text-text-dark-secondary uppercase tracking-[0.5em] opacity-60">Operations</h3>
            <p className="text-xl font-black text-white uppercase tracking-tighter leading-none italic">Log Stream</p>
        </div>
        {/* FIX: Closed missing div and added audit log shortcut button */}
        <div className="flex items-center gap-3">
          <button onClick={goToLog} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-text-dark-secondary hover:text-white">
            <Icons.ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
        {sortedLogs.length > 0 ? (
          sortedLogs.map(log => (
            <LogEntry 
                key={log.id} 
                log={log} 
                user={users.find(u => u.id === log.userId)} 
                isAI={log.userId === 'system' || log.action?.includes('ai')}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
             <Icons.ClipboardListIcon className="w-16 h-16 mb-4" />
             <p className="font-black uppercase tracking-widest text-xs">Nicio activitate recentă</p>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-white/5 mt-auto">
        <button onClick={goToLog} className="w-full py-4 rounded-2xl bg-white/5 hover:bg-primary-500 hover:text-black transition-all font-black uppercase text-[10px] tracking-widest border border-white/5 hover:border-primary-500">
          Vezi Jurnal Complet &rarr;
        </button>
      </div>
    </div>
  );
};

// FIX: Added default export as required by Dashboard.tsx
export default ActivityStream;
