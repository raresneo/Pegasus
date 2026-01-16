
import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { User, UserRole } from '../../types';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';

const UserAdminSettings: React.FC = () => {
    const { users, addUser, updateUser, deleteUser } = useDatabase();
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    
    const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
        name: '',
        email: '',
        role: 'trainer',
        password: ''
    });
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    const openAddModal = () => {
        setFormData({ name: '', email: '', role: 'trainer', password: '' });
        setEditingUserId(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
        setEditingUserId(user.id);
        setIsFormModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            alert("Numele și Email-ul sunt obligatorii.");
            return;
        }

        try {
            if (editingUserId) {
                updateUser({ 
                    id: editingUserId, 
                    name: formData.name!, 
                    email: formData.email!, 
                    role: formData.role as UserRole, 
                    avatar: formData.name!.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                    password: formData.password 
                });
            } else {
                addUser({
                    name: formData.name!,
                    email: formData.email!,
                    role: formData.role as UserRole,
                    password: formData.password || 'password123'
                });
            }
            setIsFormModalOpen(false);
        } catch (e) {
            alert('Eroare la salvarea utilizatorului.');
        }
    };

    const getRoleBadge = (role: UserRole) => {
        const configs = {
            admin: { label: 'Administrator / Manager', class: 'bg-primary-500/10 text-primary-500 border-primary-500/20' },
            trainer: { label: 'Specialist / Trainer', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            member: { label: 'Client / Membru', class: 'bg-green-500/10 text-green-400 border-green-500/20' }
        };
        const config = configs[role] || configs.member;
        return <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${config.class}`}>{config.label}</span>;
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn">
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Revocare Acces"
                description={`Ești sigur că vrei să dezactivezi contul lui ${userToDelete?.name}? Utilizatorul va fi deconectat imediat.`}
                onConfirm={() => { if(userToDelete) deleteUser(userToDelete.id); setIsDeleteModalOpen(false); }}
                confirmText="Șterge Acces"
                confirmColor="red"
            />

            <FormModal 
                isOpen={isFormModalOpen} 
                onClose={() => setIsFormModalOpen(false)} 
                title={editingUserId ? 'Editare Cont Personal' : 'Creează Cont Specialist Nou'}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nume Complet</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500 text-white"
                            placeholder="ex: Andrei Ionescu"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Email (Identitate Hub)</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500 text-white"
                            placeholder="email@fitable.ro"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Tip Permisiuni</label>
                        <select 
                            value={formData.role} 
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                            className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500 text-white"
                        >
                            <option value="trainer">Specialist (Trainer)</option>
                            <option value="admin">Administrator (Manager Spațiu)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Parolă Temporară</label>
                        <input 
                            type="password" 
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="w-full p-4 bg-background-dark rounded-2xl border border-white/10 font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500 text-white"
                            placeholder="min 8 caractere"
                        />
                    </div>
                </div>
                <div className="mt-10 flex gap-3">
                    <button onClick={() => setIsFormModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white/5 hover:bg-white/10 transition-all text-white">Anulează</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-primary-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all">Salvează Staff</button>
                </div>
            </FormModal>

            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Echipă & Permisiuni</h2>
                    <p className="text-text-dark-secondary font-medium mt-1">Gestionează specialiștii și administratorii spațiului Pegasus.</p>
                </div>
                <button onClick={openAddModal} className="bg-primary-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-500/20 hover:scale-105 transition-all">
                    + Adaugă Specialist
                </button>
            </div>

            <div className="bg-card-dark rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Identitate</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Nivel Acces</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-40">Status Nod</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Acțiuni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center font-black text-primary-500 border border-primary-500/20 shadow-inner">
                                                {u.avatar}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight text-white">{u.name}</p>
                                                <p className="text-xs opacity-40 font-medium text-white">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {getRoleBadge(u.role)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Online</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(u)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-white">
                                                <Icons.PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => { setUserToDelete(u); setIsDeleteModalOpen(true); }}
                                                className="p-2.5 bg-red-500/5 hover:bg-red-500/20 rounded-xl text-red-500 transition-all border border-red-500/10"
                                            >
                                                <Icons.TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8 p-8 bg-primary-500/5 rounded-[2.5rem] border border-primary-500/10 flex items-start gap-5">
                <div className="p-3 bg-primary-500 text-black rounded-2xl shadow-lg">
                    <Icons.ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase tracking-widest text-primary-500 mb-1">Politică de Securitate Pegasus</h4>
                    <p className="text-xs text-text-dark-secondary leading-relaxed font-medium">Toate conturile de staff au acces restricționat la datele financiare globale ale clubului. Doar contul de "Administrator" poate vedea rapoartele de profitabilitate și poate modifica infrastructura dicționarelor Core.</p>
                </div>
            </div>
        </div>
    );
};

export default UserAdminSettings;
