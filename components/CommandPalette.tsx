import React, { useState, useEffect, useMemo } from 'react';
import { menuItems } from '../lib/menu';
import { Member, MenuItem } from '../types';
import * as Icons from './icons';
import { useDatabase } from '../context/DatabaseContext';

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNavigate: (item: MenuItem) => void;
  onViewMember: (member: Member) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, onNavigate, onViewMember }) => {
  const { members } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const allPages = useMemo(() => {
    const flattened: MenuItem[] = [];
    const flatten = (items: MenuItem[]) => {
      items.forEach(item => {
        if (!item.children || item.children.length === 0) {
          flattened.push(item);
        }
        if (item.children) {
          flatten(item.children);
        }
      });
    };
    flatten(menuItems);
    return flattened;
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    
    const lowerSearch = searchTerm.toLowerCase();

    const filteredPages = allPages
      .filter(item => item.label.toLowerCase().includes(lowerSearch))
      .map(item => ({ type: 'page' as const, data: item }));

    const filteredMembers = members
      .filter(member => `${member.firstName} ${member.lastName}`.toLowerCase().includes(lowerSearch))
      .map(member => ({ type: 'member' as const, data: member }));
      
    return [...filteredMembers, ...filteredPages];
  }, [searchTerm, allPages, members]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % (filteredItems.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[activeIndex]) {
                handleSelect(filteredItems[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredItems]);

  const handleSelect = (item: { type: 'page' | 'member'; data: MenuItem | Member }) => {
    if (item.type === 'page') {
        onNavigate(item.data as MenuItem);
    } else {
        onViewMember(item.data as Member);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-20 animate-fadeIn" onClick={() => setIsOpen(false)}>
      <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-xl w-full max-w-lg animate-scaleIn"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center p-4 border-b border-border-light dark:border-border-dark">
            <Icons.SearchIcon className="w-5 h-5 text-text-light-secondary dark:text-text-dark-secondary mr-3" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setActiveIndex(0); }}
                placeholder="Search for pages or members..."
                className="w-full bg-transparent outline-none"
                autoFocus
            />
        </div>
        <ul className="p-2 max-h-96 overflow-y-auto">
            {filteredItems.length > 0 ? (
                 <>
                    {filteredItems.filter(i => i.type === 'member').length > 0 && <li className="px-3 pt-2 pb-1 text-xs font-semibold text-text-dark-secondary uppercase">Members</li>}
                    {filteredItems.map((item, index) => {
                       if (item.type !== 'member') return null;
                       const member = item.data as Member;
                       return (
                            <li
                                key={member.id}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => handleSelect(item)}
                                className={`flex items-center p-3 rounded-md cursor-pointer ${
                                    index === activeIndex ? 'bg-primary-500 text-white' : 'hover:bg-background-light dark:hover:bg-background-dark'
                                }`}
                            >
                                <Icons.UserCircleIcon className={`w-5 h-5 mr-3 ${index === activeIndex ? 'text-white' : 'text-text-light-secondary dark:text-text-dark-secondary'}`} />
                                <span>{member.firstName} {member.lastName}</span>
                            </li>
                       );
                    })}
                    {filteredItems.filter(i => i.type === 'page').length > 0 && <li className="px-3 pt-2 pb-1 text-xs font-semibold text-text-dark-secondary uppercase">Pages</li>}
                    {filteredItems.map((item, index) => {
                        if (item.type !== 'page') return null;
                        const page = item.data as MenuItem;
                        const Icon = Icons[page.icon as keyof typeof Icons] || Icons.DocumentTextIcon;
                        return (
                            <li
                                key={page.id}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => handleSelect(item)}
                                className={`flex items-center p-3 rounded-md cursor-pointer ${
                                    index === activeIndex ? 'bg-primary-500 text-white' : 'hover:bg-background-light dark:hover:bg-background-dark'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${index === activeIndex ? 'text-white' : 'text-text-light-secondary dark:text-text-dark-secondary'}`} />
                                <span>{page.label}</span>
                            </li>
                        );
                    })}
                </>
            ) : (
                searchTerm && <li className="p-4 text-center text-text-light-secondary dark:text-text-dark-secondary">No results found.</li>
            )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
