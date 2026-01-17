import React, { useState, useMemo, useEffect } from 'react';
import * as Icons from './icons';
import MiniCalendar from './MiniCalendar';
import { Member, Booking, Resource } from '../types';
import ScheduleStats from './ScheduleStats';

interface ScheduleSidebarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSyncCalendar: () => void;
  members: Member[];
  onMemberSelect: (memberId: string | null) => void;
  selectedMemberId: string | null;
  highlightedDates: string[];
  isOpen: boolean;
  onClose: () => void;
  visibleBookings: Booking[];
  visibleResources: Resource[];
}

const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({
  currentDate,
  onDateChange,
  onSyncCalendar,
  members,
  onMemberSelect,
  selectedMemberId,
  highlightedDates,
  isOpen,
  onClose,
  visibleBookings,
  visibleResources,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedMemberId) {
      const member = members.find(m => m.id === selectedMemberId);
      if (member) {
        setSearchTerm(`${member.firstName} ${member.lastName}`);
      }
    } else {
      setSearchTerm('');
    }
  }, [selectedMemberId, members]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm || selectedMemberId) return [];
    return members.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limit results for performance
  }, [members, searchTerm, selectedMemberId]);

  const handleSelect = (member: Member) => {
    onMemberSelect(member.id);
    setSearchTerm(`${member.firstName} ${member.lastName}`);
  };

  const handleClear = () => {
    onMemberSelect(null);
    setSearchTerm('');
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <aside className={`fixed inset-y-0 right-0 z-40 bg-card-dark p-4 flex-shrink-0 border-l border-border-dark flex flex-col transform transition-all duration-300 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isCollapsed ? 'md:w-12 md:p-2' : 'md:w-72'}`}>
        <div className="flex items-center justify-between md:hidden mb-4">
          <h2 className="text-lg font-bold">Filters & Calendar</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-background-dark"><Icons.XIcon className="w-5 h-5" /></button>
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-card-dark border border-border-dark border-r-0 rounded-l-lg items-center justify-center text-text-secondary hover:text-white"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Icons.ChevronRightIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className={`flex flex-col h-full transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}>
          <div className="relative mb-4">
            <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
            <input
              type="text"
              placeholder="Filter by member..."
              value={searchTerm}
              onChange={(e) => {
                if (selectedMemberId) {
                  handleClear();
                }
                setSearchTerm(e.target.value);
              }}
              className="pl-10 p-2 w-full bg-background-dark rounded-md text-sm border border-border-dark focus:ring-primary-500 focus:border-primary-500"
            />
            {searchTerm && (
              <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 p-1">
                <Icons.XIcon className="w-4 h-4 text-text-dark-secondary" />
              </button>
            )}
            {filteredMembers.length > 0 && (
              <ul className="absolute z-10 w-full bg-card-dark shadow-lg rounded-md mt-1 border border-border-dark max-h-60 overflow-y-auto">
                {filteredMembers.map(member => (
                  <li key={member.id} onMouseDown={() => handleSelect(member)} className="p-2 hover:bg-background-dark cursor-pointer text-sm">
                    {member.firstName} {member.lastName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <MiniCalendar
            currentDate={currentDate}
            onDateChange={onDateChange}
            highlightedDates={highlightedDates}
          />

          <ScheduleStats bookings={visibleBookings} resources={visibleResources} />

          <div className="mt-auto pt-4 border-t border-border-dark">
            <button
              onClick={onSyncCalendar}
              className="w-full flex items-center justify-center bg-background-dark text-text-dark-secondary px-4 py-2 rounded-md hover:bg-border-dark hover:text-text-dark-primary text-sm font-medium transition-colors">
              <Icons.DownloadIcon className="w-5 h-5 mr-2" />
              Sync Calendar
            </button>
          </div>
        </div>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default ScheduleSidebar;