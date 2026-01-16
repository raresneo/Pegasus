
import React, { useState, useMemo } from 'react';
import { Member } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import { useDatabase } from '../../context/DatabaseContext';
// Added missing imports for date-fns
import { format, parseISO } from 'date-fns';

interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight: string;
}

interface WorkoutProgram {
    id: string;
    name: string;
    exercises: Exercise[];
    createdAt: string;
}

interface TrainingTabProps {
    member: Member;
}

const TrainingTab: React.FC<TrainingTabProps> = ({ member }) => {
    const { trainerReviews, users } = useDatabase();
    
    const [workouts, setWorkouts] = useState<WorkoutProgram[]>([
        { id: '1', name: 'Elite Hypertrophy Day 1', createdAt: '2024-03-01', exercises: [
            { id: 'e1', name: 'Barbell Bench Press', sets: 4, reps: '8-10', weight: '80kg' },
            { id: 'e2', name: 'Incline DB Flyes', sets: 3, reps: '12', weight: '20kg' }
        ]},
        { id: '2', name: 'Lower Body Strength', createdAt: '2024-03-05', exercises: [
            { id: 'e3', name: 'Back Squat', sets: 5, reps: '5', weight: '120kg' }
        ]}
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProgramName, setNewProgramName] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);

    const handleAddProgram = () => {
        if (newProgramName) {
            const newP: WorkoutProgram = {
                id: `p_${Date.now()}`,
                name: newProgramName,
                createdAt: new Date().toISOString().split('T')[0],
                exercises: []
            };
            setWorkouts(prev => [newP, ...prev]);
            setNewProgramName('');
            setIsModalOpen(false);
            setSelectedProgram(newP);
        }
    };

    const handleAddExercise = (programId: string) => {
        const name = prompt('Nume exercițiu:');
        if (!name) return;
        
        setWorkouts(prev => prev.map(p => {
            if (p.id === programId) {
                return {
                    ...p,
                    exercises: [...p.exercises, {
                        id: `ex_${Date.now()}`,
                        name,
                        sets: 3,
                        reps: '10',
                        weight: '0kg'
                    }]
                };
            }
            return p;
        }));
    };

    const memberReviews = useMemo(() => {
        return trainerReviews.filter(r => r.memberId === member.id);
    }, [member.id, trainerReviews]);
    
    return (
        <div className="space-y-12 animate-fadeIn">
            <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Constructor Program Antrenament">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Denumire Program</label>
                        <input 
                            type="text" 
                            value={newProgramName} 
                            onChange={e => setNewProgramName(e.target.value)} 
                            className="p-4 w-full bg-background-dark rounded-2xl border border-white/10 font-bold outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="ex: Push Day Focus"
                        />
                    </div>
                </div>
                <div className="mt-10 flex gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] bg-white/5 hover:bg-white/10 transition-all">Anulează</button>
                    <button onClick={handleAddProgram} className="flex-1 py-4 bg-primary-500 text-black rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Creează Plan</button>
                </div>
            </FormModal>

            <section className="space-y-8">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Programe Personalizate</h3>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">Planurile de antrenament active create de specialiști.</p>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={() => setIsModalOpen(true)} className="bg-primary-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all active:scale-95 flex items-center gap-2">
                            <Icons.PlusIcon className="w-5 h-5" /> Program Nou
                         </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {workouts.map((p) => (
                        <div key={p.id} className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark overflow-hidden shadow-sm group">
                            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-background-dark/30">
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-primary-500 transition-colors">{p.name}</h4>
                                    <p className="text-[10px] font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest mt-1">Creat la: {p.createdAt} • {p.exercises.length} exerciții</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddExercise(p.id)} className="px-5 py-2 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-sm">Adaugă Exercițiu</button>
                                    <button className="p-2.5 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-text-light-secondary dark:text-text-dark-secondary hover:text-primary-500 transition-all"><Icons.PencilIcon className="w-5 h-5"/></button>
                                    <button className="p-2.5 bg-white dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl text-text-light-secondary dark:text-text-dark-secondary hover:text-red-500 transition-all"><Icons.TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            
                            {p.exercises.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[9px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary bg-gray-50 dark:bg-black/20">
                                            <tr>
                                                <th className="px-8 py-4">Exercițiu</th>
                                                <th className="px-8 py-4">Seturi</th>
                                                <th className="px-8 py-4">Repetări</th>
                                                <th className="px-8 py-4">Greutate Target</th>
                                                <th className="px-8 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {p.exercises.map(ex => (
                                                <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-4 font-bold text-sm text-text-light-primary dark:text-white">{ex.name}</td>
                                                    <td className="px-8 py-4 font-black text-primary-500">{ex.sets}</td>
                                                    <td className="px-8 py-4 font-bold opacity-60">{ex.reps}</td>
                                                    <td className="px-8 py-4 font-black">{ex.weight}</td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
                                                            <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10"></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-text-light-secondary dark:text-text-dark-secondary opacity-30 italic text-sm">
                                    Niciun exercițiu definit. Adaugă primul exercițiu pentru a începe planificarea.
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
            </section>

            {memberReviews.length > 0 && (
                <section className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-tighter border-l-4 border-accent-500 pl-4">Note de Evoluție (Antrenori)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memberReviews.map(rev => {
                            const trainer = users.find(u => u.id === rev.trainerId);
                            return (
                                <div key={rev.id} className="p-6 bg-white dark:bg-card-dark rounded-3xl border border-border-light dark:border-border-dark shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-accent-500/10 rounded-xl flex items-center justify-center font-black text-accent-500 text-xs border border-accent-500/20">
                                                {trainer?.avatar || 'T'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight">{trainer?.name || 'Trainer'}</p>
                                                <div className="flex gap-0.5 mt-0.5">
                                                    {[...Array(5)].map((_, i) => <Icons.StarIcon key={i} className={`w-3 h-3 ${i < rev.stars ? 'text-yellow-500 fill-current' : 'text-gray-300 dark:text-gray-700'}`} />)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] uppercase font-black opacity-30 tracking-widest">{format(parseISO(rev.date), 'dd MMM yyyy')}</span>
                                    </div>
                                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary italic leading-relaxed">"{rev.comment}"</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <section className="bg-primary-500/5 rounded-[2.5rem] border border-primary-500/10 p-10 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
                    <Icons.ChartPieIcon className="w-10 h-10 text-primary-500" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Analiza Biometrică</h3>
                 <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-2 max-w-lg">Nu există date biometrice recente (Body Fat, Muscle Mass). Vă rugăm să programați o evaluare la terminalul Pegasus.</p>
                 <button className="mt-8 px-10 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Programare Evaluare</button>
            </section>
        </div>
    );
};

export default TrainingTab;
