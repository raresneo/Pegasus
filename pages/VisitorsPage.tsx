
import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Member, CommunicationType } from '../types';
import * as Icons from '../components/icons';
import { format, isSameDay, startOfDay, endOfDay, parseISO } from 'date-fns';
import FormModal from '../components/FormModal';

interface VisitorsPageProps {
    onViewMember: (member: Member) => void;
}

type AttendanceStatus = 'Present' | 'Absent' | 'Not Marked';

const StatCard: React.FC<{ icon: React.FC<any>, value: string | number, label: string, color: string }> = ({ icon: Icon, value, label, color }) => (
    <div className="flex-1 bg-card-dark p-4 rounded-lg flex items-center gap-4 border border-border-dark">
        <div className={`p-2 rounded-full ${color}/20`}>
            <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-text-dark-secondary">{label}</p>
        </div>
    </div>
);

const VisitorsPage: React.FC<VisitorsPageProps> = ({ onViewMember }) => {
    const { members, addCheckIn, addCommunication, absenceReasons } = useDatabase();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [memberToMark, setMemberToMark] = useState<Member | null>(null);
    const [absenceReason, setAbsenceReason] = useState(absenceReasons[0]?.id || '');
    const [absenceNotes, setAbsenceNotes] = useState('');

    const { attendanceData, stats } = useMemo(() => {
        const statuses: { [memberId: string]: { status: AttendanceStatus; details?: string } } = {};
        let present = 0;
        let absent = 0;

        for (const member of members) {
            const hasVisit = member.visitHistory?.some(visit => isSameDay(parseISO(visit.date), selectedDate));
            if (hasVisit) {
                statuses[member.id] = { status: 'Present' };
                present++;
                continue;
            }
            const absenceRecord = member.communications?.find(comm => 
                comm.type === 'absence' && isSameDay(parseISO(comm.date), selectedDate)
            );
            if (absenceRecord) {
                statuses[member.id] = { status: 'Absent', details: absenceRecord.subject };
                absent++;
                continue;
            }
            statuses[member.id] = { status: 'Not Marked' };
        }
        return { 
            attendanceData: statuses,
            stats: {
                present,
                absent,
                notMarked: members.length - present - absent,
            }
        };
    }, [members, selectedDate]);

    const filteredMembers = useMemo(() => {
        return members.filter(member => 
            `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);
    
    const openAbsenceModal = (member: Member) => {
        setMemberToMark(member);
        setAbsenceReason(absenceReasons[0]?.id || '');
        setAbsenceNotes('');
        setIsAbsenceModalOpen(true);
    };

    const handleMarkAbsent = () => {
        if (!memberToMark) return;
        const reason = absenceReasons.find(r => r.id === absenceReason);
        addCommunication(memberToMark.id, {
            type: 'absence',
            subject: reason?.name || 'Absent',
            notes: absenceNotes
        });
        setIsAbsenceModalOpen(false);
    };

    const getStatusChip = (status: AttendanceStatus) => {
        const colors: Record<AttendanceStatus, string> = {
            'Present': 'bg-green-500/20 text-green-400',
            'Absent': 'bg-red-500/20 text-red-400',
            'Not Marked': 'bg-gray-500/20 text-gray-400'
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            {memberToMark && (
                 <FormModal isOpen={isAbsenceModalOpen} onClose={() => setIsAbsenceModalOpen(false)} title={`Mark ${memberToMark.firstName} as Absent`}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-dark-secondary mb-1">Reason</label>
                            <select value={absenceReason} onChange={e => setAbsenceReason(e.target.value)} className="p-2 w-full bg-background-dark rounded-md border border-border-dark">
                                {absenceReasons.map(reason => <option key={reason.id} value={reason.id}>{reason.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-dark-secondary mb-1">Notes (Optional)</label>
                            <textarea value={absenceNotes} onChange={e => setAbsenceNotes(e.target.value)} rows={3} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"></textarea>
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setIsAbsenceModalOpen(false)} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                        <button onClick={handleMarkAbsent} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Mark Absent</button>
                    </div>
                </FormModal>
            )}

            <h1 className="text-3xl font-bold">Visitors & Attendance</h1>

             <div className="flex flex-col sm:flex-row gap-4">
                <StatCard icon={Icons.CheckCircleIcon} value={stats.present} label="Present" color="text-green-400" />
                <StatCard icon={Icons.XCircleIcon} value={stats.absent} label="Absent" color="text-red-400" />
                <StatCard icon={Icons.QuestionMarkCircleIcon} value={stats.notMarked} label="Not Marked" color="text-gray-400" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card-dark rounded-lg border border-border-dark">
                <div className="relative">
                    <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                    <input type="text" placeholder="Search members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 p-2 w-full bg-background-dark rounded-md border border-border-dark" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Date:</span>
                    <input type="date" value={format(selectedDate, 'yyyy-MM-dd')} onChange={e => setSelectedDate(new Date(e.target.value))} className="p-2 bg-background-dark rounded-md border border-border-dark"/>
                </div>
            </div>
            
            <div className="overflow-x-auto bg-card-dark rounded-lg border border-border-dark">
                <table className="w-full text-sm text-left text-text-dark-secondary">
                    <thead className="text-xs text-text-dark-primary uppercase bg-background-dark">
                        <tr>
                            <th className="px-6 py-3">Member</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Contact</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark">
                        {filteredMembers.map(member => {
                            const attendance = attendanceData[member.id];
                            return (
                                <tr key={member.id} className="hover:bg-background-dark/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center font-bold text-primary-200">{member.avatar}</div>
                                            <div>
                                                <div className="font-semibold text-text-dark-primary">{member.firstName} {member.lastName}</div>
                                                <div className="text-xs">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusChip(attendance.status)}
                                        {attendance.status === 'Absent' && <p className="text-xs mt-1">({attendance.details})</p>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <a href={`https://wa.me/${member.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-green-500/20 text-green-500 rounded-md transition-colors" title="WhatsApp">
                                                <Icons.WhatsAppIcon className="w-5 h-5" />
                                            </a>
                                            <a href={`tel:${member.phone}`} className="p-2 hover:bg-indigo-500/20 text-indigo-500 rounded-md transition-colors" title="Call">
                                                <Icons.PhoneIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {attendance.status !== 'Present' && (
                                                <button onClick={() => addCheckIn(member.id)} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-500/20 rounded-md hover:bg-green-500/30">Check-in</button>
                                            )}
                                            {attendance.status === 'Not Marked' && (
                                                 <button onClick={() => openAbsenceModal(member)} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-500/20 rounded-md hover:bg-red-500/30">Mark Absent</button>
                                            )}
                                            <button onClick={() => onViewMember(member)} className="p-2 rounded-md hover:bg-border-dark" title="View Detail"><Icons.ChevronRightIcon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredMembers.length === 0 && (
                    <div className="text-center py-16">
                        <Icons.UsersIcon className="mx-auto h-12 w-12 text-border-dark" />
                        <h3 className="mt-2 text-lg font-semibold text-text-dark-primary">No Members Found</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorsPage;
