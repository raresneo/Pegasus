
import React, { useState, useRef } from 'react';
import { MenuItem } from '../types';
import { MenuIcon, BellIcon, SearchIcon, ChevronRightIcon, MapPinIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import { useLanguage } from '../context/LanguageContext';
import { useClickOutside } from '../hooks/useClickOutside';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  currentItem: MenuItem;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onSearchClick, currentItem }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { locations, currentLocationId, setCurrentLocationId } = useDatabase();
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const locationRef = useRef(null);
  
  useClickOutside(locationRef, () => setIsLocationMenuOpen(false));

  const currentLocName = currentLocationId === 'all' 
    ? (language === 'ro' ? 'Global' : 'Global') 
    : locations.find(l => l.id === currentLocationId)?.name || 'Locație';

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-8 bg-black border-b border-white/10 shadow-sm flex-shrink-0 relative z-30">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden mr-4 text-white">
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center text-sm">
          <span className="font-black text-primary-500 tracking-tighter uppercase text-lg">Pegasus</span>
          <ChevronRightIcon className="w-4 h-4 mx-3 text-white opacity-20" />
          <span className="font-black text-white uppercase tracking-[0.3em] text-[10px] opacity-80 text-high-contrast">
            {t(currentItem?.label) || 'Terminal'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4 sm:space-x-6">
        {user?.role === 'admin' && (
          <div className="relative" ref={locationRef}>
            <button 
              onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary-500 text-black hover:bg-primary-600 transition-all shadow-lg"
            >
              <MapPinIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentLocName}</span>
            </button>
            {isLocationMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-card-dark rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
                <ul className="p-2 space-y-1">
                  <li onClick={() => { setCurrentLocationId('all'); setIsLocationMenuOpen(false); }} className={`p-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${currentLocationId === 'all' ? 'bg-primary-500 text-black' : 'text-white hover:bg-white/5'}`}>
                    Toate Locațiile
                  </li>
                  {locations.map(loc => (
                    <li key={loc.id} onClick={() => { setCurrentLocationId(loc.id); setIsLocationMenuOpen(false); }} className={`p-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${currentLocationId === loc.id ? 'bg-primary-500 text-black' : 'text-white hover:bg-white/5'}`}>{loc.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div 
          onClick={onSearchClick}
          className="hidden sm:flex items-center bg-white/5 hover:bg-white/10 rounded-2xl p-2 px-5 cursor-pointer w-56 border border-white/5 transition-all group"
        >
          <SearchIcon className="w-4 h-4 text-primary-500 group-hover:scale-110 transition-transform" />
          <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-white/40">Caută rapid...</span>
        </div>

        <button className="p-2.5 rounded-xl hover:bg-white/5 text-primary-500">
            <BellIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
