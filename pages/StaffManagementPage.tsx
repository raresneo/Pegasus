
import React, { useState, useMemo } from 'react';
import * as Icons from '../components/icons';
import { useDatabase } from '../context/DatabaseContext';
import UserAdminSettings from '../components/settings/UserAdminSettings';
import FormModal from '../components/FormModal';
import { User, UserRole, TrainerReview } from '../types';
import { format, parseISO } from 'date-fns';

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <Icons.StarIcon 
                    key={star} 
                    className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                />
            ))}
            <span className="ml-1.5 text-xs font-bold text-yellow-400">{rating.toFixed(1)}</span>
        </div>
    );
};

const StaffManagementPage: React.FC = () => {
    const { users, addUser, trainerReviews, members } = useDatabase();
    const [view, setView] = useState<'landing' | 'list'>('landing');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showReviewsFor, setShowReviewsFor] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
        name: '',
        email: '',
        role: 'trainer',
        password: ''
    });

    const handleAddUser = () => {
        if (!formData.name || !formData.email) return;
        addUser({
            name: formData.name,
            email: formData.email,
            role: formData.role as UserRole,
            password: formData.password
        });
        setIsAddModalOpen(false);
        setView('list');
    };

    const selectedTrainerReviews = useMemo(() => {
        if (!showReviewsFor) return [];
        return trainerReviews
            .filter(r => r.trainerId === showReviewsFor.id)
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [showReviewsFor, trainerReviews]);

    if (view === 'list' || users.length > 1) {
        return (
            <div className="animate-fadeIn space-y-8">
                <FormModal isOpen={!!showReviewsFor} onClose={() => setShowReviewsFor(null)} title={`Review-uri: ${showReviewsFor?.name}`}>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {selectedTrainerReviews.length > 0 ? selectedTrainerReviews.map(rev => {
                            const member = members.find(m => m.id === rev.memberId);
                            return (
                                <div key={rev.id} className="p-4 bg-background-dark rounded-xl border border-border-dark">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm">{member ? `${member.firstName} ${member.lastName}` : 'Membru'}</p>
                                            <p className="text-[10px] text-text-dark-secondary uppercase font-bold">{format(parseISO(rev.date), 'dd MMM yyyy')}</p>
                                        </div>
                                        <RatingStars rating={rev.stars} />
                                    </div>
                                    <p className="text-sm text-text-dark-secondary italic leading-relaxed">"{rev.comment}"</p>
                                </div>
                            );
                        }) : <p className="text-center py-10 opacity-50">Niciun review înregistrat încă.</p>}
                    </div>
                </FormModal>

                <div className="flex justify-between items-center">
                    <button onClick={() => setView('landing')} className="text-sm font-bold text-primary-500 flex items-center gap-1 hover:underline">
                        <Icons.ChevronLeftIcon className="w-4 h-4" /> Înapoi la Prezentare
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-primary-600 transition-all">
                        + Angajat Nou
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.filter(u => u.role !== 'member').map(staff => (
                        <div key={staff.id} className="bg-white dark:bg-card-dark p-6 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                             {staff.role === 'admin' && <div className="absolute top-0 right-0 p-4"><span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20 rounded-full">Admin</span></div>}
                             <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-xl border-2 border-primary-500/20">
                                    {staff.avatar}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg leading-tight">{staff.name}</h3>
                                    <RatingStars rating={staff.rating || 5} />
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-gray-50 dark:bg-background-dark p-3 rounded-2xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-[10px] font-black uppercase text-text-dark-secondary tracking-widest mb-1">Venit Generat</p>
                                    <p className="font-black text-primary-500">1.250 RON</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-background-dark p-3 rounded-2xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-[10px] font-black uppercase text-text-dark-secondary tracking-widest mb-1">Ore Lucrate</p>
                                    <p className="font-black text-green-500">42h</p>
                                </div>
                             </div>

                             <button onClick={() => setShowReviewsFor(staff)} className="w-full py-3 bg-gray-100 dark:bg-background-dark/50 hover:bg-primary-500 hover:text-white transition-all rounded-xl text-xs font-black uppercase tracking-widest border border-border-light dark:border-border-dark flex items-center justify-center gap-2">
                                <Icons.ChatAltIcon className="w-4 h-4" /> Vezi Feedback
                             </button>
                        </div>
                    ))}
                </div>

                <div className="pt-8 opacity-50">
                    <UserAdminSettings />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 animate-fadeIn">
            <FormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adaugă membru staff">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Nume Complet</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="p-3 w-full bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark" placeholder="ex: Bob Trainer"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Email</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-3 w-full bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark" placeholder="ex: bob@fitable.com"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Rol</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="p-3 w-full bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
                            <option value="trainer">Trainer</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>
                <button onClick={handleAddUser} className="w-full mt-6 bg-primary-500 text-white py-4 rounded-xl font-black shadow-lg hover:bg-primary-600 transition-all">
                    Salvează și Invită
                </button>
            </FormModal>

            <div className="text-center space-y-6">
                <h1 className="text-5xl font-black tracking-tighter text-text-light-primary dark:text-text-dark-primary uppercase">Staff Management</h1>
                
                {/* Visual Hero Section */}
                <div className="relative inline-block mt-8">
                    <div className="w-80 h-48 bg-primary-500 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                         {/* Abstract illustration elements */}
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-9xl grayscale opacity-90">🧑‍🍳👩‍⚕️</div>
                    </div>
                    {/* Floating icons to match the aesthetic */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-card-dark rounded-full shadow-lg border border-border-light dark:border-border-dark flex items-center justify-center">
                        <Icons.CheckCircleIcon className="w-6 h-6 text-green-500" />
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center">
                    <div className="bg-white dark:bg-card-dark p-8 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-primary-500 text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                            <Icons.UserCircleIcon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-lg mb-2">Staff Nelimitat</h3>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Gestionează calendarele echipei tale, portofoliul de clienți și plățile într-un singur loc.</p>
                    </div>

                    <div className="bg-white dark:bg-card-dark p-8 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-primary-500 text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                            <Icons.KeyIcon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-lg mb-2">Permisiuni Echipă</h3>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Atribuie permisiuni specifice fiecărui angajat astfel încât să vadă doar informațiile relevante rolului lor.</p>
                    </div>

                    <div className="bg-white dark:bg-card-dark p-8 rounded-[2rem] border border-border-light dark:border-border-dark shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-12 h-12 bg-primary-500 text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                            <Icons.ChartBarIcon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-lg mb-2">Rapoarte Staff</h3>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">Urmărește performanța individuală a staff-ului, veniturile generate și orele lucrate.</p>
                    </div>
                </div>

                <div className="pt-12">
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary-500 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all hover:scale-105 active:scale-95"
                    >
                        Adaugă membri staff
                    </button>
                    {users.length > 1 && (
                         <p className="mt-4 text-xs text-text-light-secondary dark:text-text-dark-secondary font-bold uppercase tracking-widest cursor-pointer hover:underline" onClick={() => setView('list')}>
                            Vezi lista de staff existentă
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffManagementPage;
