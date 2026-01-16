import React, { useState, useMemo } from 'react';
import { Member } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import { format, parseISO, isWithinInterval } from 'date-fns';

interface VisitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

const VisitHistoryModal: React.FC<VisitHistoryModalProps> = ({ isOpen, onClose, member }) => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const filteredVisits = useMemo(() => {
        const visits = member.visitHistory || [];
        if (!startDate || !endDate) return visits;

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return visits.filter(visit => {
            const visitDate = parseISO(visit.date);
            return isWithinInterval(visitDate, { start, end });
        }).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    }, [member.visitHistory, startDate, endDate]);

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title={`Visit History for ${member.firstName}`}>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-background-dark rounded-md">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-text-dark-secondary mb-1">From Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 w-full bg-card-dark rounded-md border border-border-dark text-sm"/>
                    </div>
                     <div className="flex-1">
                        <label className="block text-xs font-medium text-text-dark-secondary mb-1">To Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 w-full bg-card-dark rounded-md border border-border-dark text-sm"/>
                    </div>
                </div>

                <div className="p-4 bg-background-dark rounded-md text-center">
                    <p className="text-text-dark-secondary">Total Visits in Period</p>
                    <p className="text-2xl font-bold">{filteredVisits.length}</p>
                </div>

                <div className="max-h-64 overflow-y-auto">
                    {filteredVisits.length > 0 ? (
                        <ul className="divide-y divide-border-dark">
                            {filteredVisits.map((visit, index) => (
                                <li key={index} className="py-3 px-2 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{format(parseISO(visit.date), 'EEEE, MMMM d, yyyy')}</p>
                                        <p className="text-sm text-text-dark-secondary">{format(parseISO(visit.date), 'p')}</p>
                                    </div>
                                    <span className="text-xs text-text-dark-secondary">Duration: N/A</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-text-dark-secondary">
                            <p>No visits found in this date range.</p>
                        </div>
                    )}
                </div>
            </div>
             <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-background-dark rounded-md hover:bg-border-dark">Close</button>
            </div>
        </FormModal>
    );
};

export default VisitHistoryModal;