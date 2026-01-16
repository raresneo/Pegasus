
import React, { useState, useMemo } from 'react';
import { Task } from '../../types';
import * as Icons from '../icons';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import FormModal from '../FormModal';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

const DayTasksModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}> = ({ isOpen, onClose, date, tasks, onTaskClick }) => {
    if (!isOpen || !date) return null;

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title={`Sarcini pentru ${format(date, 'd MMMM yyyy')}`}>
            <div className="max-h-96 overflow-y-auto">
                {tasks.length > 0 ? (
                    <ul className="space-y-2">
                        {tasks.map(task => (
                            <li key={task.id} onClick={() => { onTaskClick(task); onClose(); }} className="p-3 bg-background-dark rounded-md cursor-pointer hover:bg-border-dark">
                                <p className="font-semibold">{task.name}</p>
                                <p className="text-xs text-text-dark-secondary">Scadență: {format(new Date(task.endDate), 'p')}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-text-dark-secondary text-center py-4">Nu sunt sarcini programate.</p>
                )}
            </div>
             <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-background-dark rounded-md hover:bg-border-dark">Închide</button>
            </div>
        </FormModal>
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onTaskClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    const days = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);
    
    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            const dateKey = format(new Date(task.endDate), 'yyyy-MM-dd');
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(task);
        });
        return map;
    }, [tasks]);

    const handleDayClick = (day: Date) => {
        setSelectedDay(day);
        setIsDayModalOpen(true);
    };

    return (
        <div className="bg-card-dark rounded-lg border border-border-dark flex flex-col h-[calc(100vh-18rem)]">
            <DayTasksModal 
                isOpen={isDayModalOpen} 
                onClose={() => setIsDayModalOpen(false)} 
                date={selectedDay} 
                tasks={selectedDay ? (tasksByDate.get(format(selectedDay, 'yyyy-MM-dd')) || []) : []} 
                onTaskClick={onTaskClick} 
            />
            <header className="flex items-center justify-between p-4 border-b border-border-dark">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-border-dark"><Icons.ChevronLeftIcon className="w-5 h-5"/></button>
                <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-border-dark"><Icons.ChevronRightIcon className="w-5 h-5"/></button>
            </header>

            <div className="grid grid-cols-7 flex-grow">
                {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map(day => (
                    <div key={day} className="text-center py-2 text-xs font-bold uppercase text-text-dark-secondary border-b border-border-dark">{day}</div>
                ))}
                {days.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayTasks = tasksByDate.get(dateKey) || [];
                    return (
                        <div key={dateKey} onClick={() => handleDayClick(day)} className={`relative p-2 border-r border-b border-border-dark cursor-pointer ${!isSameMonth(day, currentMonth) ? 'bg-background-dark/50' : ''}`}>
                            <time dateTime={dateKey} className={`text-sm ${isToday(day) ? 'bg-primary-500 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold' : ''} ${!isSameMonth(day, currentMonth) ? 'text-text-dark-secondary/50' : ''}`}>
                                {format(day, 'd')}
                            </time>
                            <div className="mt-2 space-y-1">
                                {dayTasks.slice(0, 3).map(task => (
                                    <div key={task.id} onClick={(e) => { e.stopPropagation(); onTaskClick(task); }} className="p-1 text-xs rounded bg-border-dark truncate cursor-pointer hover:bg-primary-500 hover:text-white">
                                        {task.name}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-xs text-text-dark-secondary text-center cursor-pointer hover:underline">
                                        + {dayTasks.length - 3} mai multe
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
