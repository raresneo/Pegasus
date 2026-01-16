
import React, { useState, useMemo, memo } from 'react';
import { MenuItem } from '../types';
import * as Icons from './icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useDatabase } from '../context/DatabaseContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentItem: MenuItem;
  onNavigate: (item: MenuItem) => void;
  menuItems: MenuItem[];
}

const NavItem = memo(({ item, isActive, isSubmenuOpen, onClick, t, isCollapsed }: any) => {
  const IconComponent = Icons[item.icon as keyof typeof Icons];
  const Icon = typeof IconComponent === 'function' ? IconComponent : Icons.HomeIcon;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className="mb-2 list-none relative">
      {isActive && !isCollapsed && (
        <div className="absolute left-[-24px] top-1.5 bottom-1.5 w-1.5 bg-primary-500 rounded-r-full shadow-[0_0_20px_rgba(212,175,55,1)] z-20" />
      )}
      <div
        onClick={() => onClick(item)}
        className={`group flex items-center justify-between px-5 py-4 rounded-[1.25rem] cursor-pointer transition-all duration-500 relative overflow-hidden ${isActive
            ? 'bg-primary-500/10 text-primary-500 shadow-[inset_0_0_30px_rgba(212,175,55,0.05)] border border-primary-500/20'
            : 'text-text-dark-secondary/60 hover:bg-white/[0.03] hover:text-white border border-transparent'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
        title={isCollapsed ? t(item.label) : ''}
      >
        <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

        <div className={`flex items-center relative z-10 ${isCollapsed ? 'justify-center' : ''}`}>
          <Icon className={`w-5 h-5 transition-all duration-500 ${isCollapsed ? '' : 'mr-4'} ${isActive ? 'text-primary-500 scale-110 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]' : 'group-hover:text-primary-400 group-hover:scale-110'}`} />
          {!isCollapsed && (
            <span className={`text-[11px] font-black uppercase tracking-[0.25em] transition-transform duration-500 ${isActive ? 'translate-x-1 text-primary-500' : 'group-hover:translate-x-1'}`}>
              {t(item.label)}
            </span>
          )}
        </div>
        {hasChildren && !isCollapsed && (
          <Icons.ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-500 relative z-10 ${isSubmenuOpen ? 'rotate-180' : ''} ${isActive ? 'text-primary-500' : 'opacity-20'}`}
          />
        )}
      </div>
      {hasChildren && !isCollapsed && (
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isSubmenuOpen ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
          <ul className="pl-6 space-y-1.5 border-l border-white/5 ml-7 py-2">
            {item.children!.map((child: MenuItem) => (
              <li key={child.id} onClick={() => onClick(child)} className={`px-4 py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${isActive && child.id === item.id ? 'text-primary-500 bg-primary-500/5 shadow-inner' : 'text-text-dark-secondary/40 hover:text-primary-400 hover:bg-white/5'}`}>
                {t(child.label)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
});

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, currentItem, onNavigate, menuItems }) => {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const { onlineHubSettings } = useDatabase();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => onlineHubSettings.visibleModuleIds.includes(item.id));
  }, [menuItems, onlineHubSettings.visibleModuleIds]);

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      setOpenSubmenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
    } else {
      onNavigate(item);
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-background-dark shadow-[60px_0_120px_-20px_rgba(0,0,0,0.8)] border-r border-white/5 transform transition-all duration-700 md:relative md:translate-x-0 md:flex md:flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-20 w-7 h-7 bg-primary-500 rounded-full items-center justify-center text-black shadow-2xl hover:scale-110 transition-all z-50 border-2 border-black"
        >
          <Icons.ChevronLeftIcon className={`w-5 h-5 transition-transform duration-700 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className={`flex items-center h-24 border-b border-white/5 flex-shrink-0 transition-all duration-700 ${isCollapsed ? 'px-0 justify-center' : 'px-8'}`}>
          <div className="bg-primary-500 p-2.5 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.4)] flex-shrink-0 animate-glow-violet">
            <Icons.LogoIcon className="w-6 h-6 text-black" />
          </div>
          {!isCollapsed && (
            <div className="ml-5 animate-scale-in">
              <span className="text-xl font-black tracking-tighter text-white uppercase leading-none block italic">Pegasus</span>
              <p className="text-[8px] font-black text-accent-400 tracking-[0.45em] uppercase mt-2 opacity-60">Elite Core Hub</p>
            </div>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto no-scrollbar transition-all duration-700 ${isCollapsed ? 'py-8' : 'p-6'}`}>
          <ul className="space-y-1">
            {filteredMenuItems.map(item => (
              <NavItem
                key={item.id}
                item={item}
                t={t}
                isCollapsed={isCollapsed}
                isActive={currentItem?.id === item.id || item.children?.some(c => c.id === currentItem?.id)}
                isSubmenuOpen={openSubmenus[item.id]}
                onClick={handleItemClick}
              />
            ))}
          </ul>
        </nav>

        <div className={`border-t border-white/5 bg-black/60 transition-all duration-700 ${isCollapsed ? 'p-3' : 'p-6'}`}>
          <div className={`flex items-center gap-3 bg-white/[0.03] rounded-[1.75rem] border border-white/10 group transition-all hover:border-primary-500/30 ${isCollapsed ? 'p-2 justify-center flex-col' : 'p-3'}`}>
            <div className={`bg-primary-500/20 rounded-2xl flex-shrink-0 flex items-center justify-center text-primary-500 font-black text-xs border border-primary-500/20 shadow-inner transition-all ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
              {user?.avatar}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden text-left">
                <p className="font-black text-[10px] text-white truncate uppercase tracking-tight leading-3" title={user?.name}>{user?.name}</p>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest truncate mt-1">{user?.role}</p>
              </div>
            )}
            {!isCollapsed && (
              <button onClick={logout} className="flex-shrink-0 p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Logout">
                <Icons.LogOutIcon className="w-4 h-4" />
              </button>
            )}

            {isCollapsed && (
              <button onClick={logout} className="mt-2 text-white/20 hover:text-red-500 transition-all" title="Logout">
                <Icons.LogOutIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/90 backdrop-blur-md md:hidden" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
};

export default Sidebar;
