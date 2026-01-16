import React from 'react';
import * as Icons from './icons';

interface MiniCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  highlightedDates: string[]; // YYYY-MM-DD
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ currentDate, onDateChange, highlightedDates }) => {
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(1); // Avoids issues with different day counts in months
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const daysInMonth = () => {
    const date = new Date(currentDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Days from previous month
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    for (let i = 0; i < startDayOfWeek; i++) {
        const prevMonthDay = new Date(firstDay);
        prevMonthDay.setDate(prevMonthDay.getDate() - (startDayOfWeek - i));
        days.push({ day: prevMonthDay.getDate(), isCurrentMonth: false, date: prevMonthDay });
    }

    // Days in current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    // Days from next month
    const gridCells = days.length > 35 ? 42 : 35;
    const daysToPad = gridCells - days.length;

    for (let i = 1; i <= daysToPad; i++) {
        const nextMonthDay = new Date(lastDay);
        nextMonthDay.setDate(nextMonthDay.getDate() + i);
        days.push({ day: nextMonthDay.getDate(), isCurrentMonth: false, date: nextMonthDay });
    }

    return days;
  };

  const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
  const todayYYYYMMDD = toYYYYMMDD(new Date());
  const selectedYYYYMMDD = toYYYYMMDD(currentDate);

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => handleMonthChange('prev')} className="p-1 rounded-full hover:bg-background-dark">
          <Icons.ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm text-text-dark-primary">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => handleMonthChange('next')} className="p-1 rounded-full hover:bg-background-dark">
          <Icons.ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-text-dark-secondary">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {daysInMonth().map(({ day, isCurrentMonth, date }, index) => {
          const dateStr = toYYYYMMDD(date);
          const isToday = dateStr === todayYYYYMMDD;
          const isSelected = dateStr === selectedYYYYMMDD;
          const isHighlighted = highlightedDates.includes(dateStr) && !isSelected;
          
           const dayClasses = `
            w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200
            ${isCurrentMonth ? 'cursor-pointer hover:bg-background-dark' : 'text-text-dark-secondary/40 pointer-events-none'}
            ${isSelected ? 'bg-primary-500 text-white font-semibold' : 'text-text-dark-primary'}
            ${isToday && !isSelected ? 'bg-border-dark text-text-dark-primary font-semibold' : ''}
          `;

          return (
            <div key={index} 
                 className="py-1 flex justify-center items-center relative"
                 onClick={isCurrentMonth ? () => onDateChange(date) : undefined}
            >
              <div className={dayClasses}>
                {day}
              </div>
              {isHighlighted && <div className="absolute bottom-1 w-1 h-1 bg-accent rounded-full"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;