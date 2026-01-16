
import React, { useState, ChangeEvent, useEffect } from 'react';
import { Member, CustomFieldDefinition } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';

// --- MOCK DATA FOR DROPDOWNS ---
const salesReps = ['Admin User', 'John Smith', 'Jane Doe'];
const trainers = ['Trainer Bob', 'Alice', 'Charlie'];
const sourcePromotions = ['Unknown', 'De la o cunoștință', 'De pe strada', 'Facebook', 'Google', 'Instagram', 'Tiktok', 'Voucher', 'Youtube'];

// --- REUSABLE FORM COMPONENTS ---
interface EditableFieldProps {
    label: string;
    name: string;
    value: any;
    isEditing: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: string;
    placeholder?: string;
    // FIX: Added 'text' to as prop types to match usage in component.
    as?: 'textarea' | 'select' | 'checkbox' | 'text';
    options?: string[];
}

const EditableField: React.FC<EditableFieldProps> = ({ label, name, value, isEditing, onChange, type = "text", as, placeholder, options }) => (
    <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-text-light-secondary dark:text-text-dark-secondary block mb-1.5 opacity-60">{label}</label>
        {isEditing ? (
             as === 'textarea' ? (
                <textarea name={name} value={value || ''} onChange={onChange} rows={3} placeholder={placeholder || label} className="p-2.5 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
             ) : as === 'select' ? (
                <select name={name} value={value || ''} onChange={onChange} className="p-2.5 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="">Select...</option>
                    {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
             ) : as === 'checkbox' ? (
                <div className="flex items-center h-10">
                    <button 
                        onClick={() => onChange({ target: { name, value: !value } } as any)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300 dark:bg-white/10'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="ml-3 text-xs font-bold uppercase tracking-widest opacity-40">{value ? 'DA' : 'NU'}</span>
                </div>
             ) : (
                <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder || label} className="p-2.5 w-full bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
             )
        ) : (
            <div className="text-sm font-bold h-10 flex items-center text-text-light-primary dark:text-text-dark-primary bg-gray-50/30 dark:bg-background-dark/30 px-3 rounded-lg border border-transparent">
                {as === 'checkbox' ? (value ? 'DA' : 'NU') : (value || '-')}
            </div>
        )}
    </div>
);

// --- MAIN COMPONENT ---
interface DetailsTabProps {
    member: Member;
    onSave: (member: Member) => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-white dark:bg-card-dark rounded-[2rem] border border-border-light dark:border-border-dark p-8 shadow-sm">
        <h3 className="text-lg font-black uppercase tracking-tight text-text-light-primary dark:text-text-dark-primary mb-6 border-b border-border-light dark:border-border-dark pb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {children}
        </div>
    </div>
);

const DetailsTab: React.FC<DetailsTabProps> = ({ member, onSave }) => {
    const { updateMember, memberCustomFields } = useDatabase();
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState<Member>(member);

    useEffect(() => {
        setData(member);
    }, [member]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('cf_')) {
            setData(prev => ({
                ...prev,
                customFields: {
                    ...(prev.customFields || {}),
                    [name]: value
                }
            }));
        } else if (name.includes('.')) {
            const [section, field] = name.split('.');
            setData(prev => ({ 
                ...prev, 
                [section]: { 
                    ...(prev[section as keyof Member] as object), 
                    [field]: value 
                } 
            }));
        } else {
            setData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        updateMember(data);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setData(member);
        setIsEditing(false);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
             <div className="flex justify-between items-center bg-white dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Live Editing Mode</span>
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <button onClick={handleCancel} className="px-6 py-2 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 dark:hover:bg-background-dark transition-colors">Anulează</button>
                        <button onClick={handleSave} className="px-6 py-2 text-sm font-black uppercase tracking-widest text-white bg-green-600 rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all">Salvează Datele</button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 text-sm font-black uppercase tracking-widest text-white bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center gap-2">
                        <Icons.PencilIcon className="w-4 h-4" /> Editare Profil
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                <DetailSection title="Informații Personale">
                    <EditableField label="Titlu" name="title" value={data.title} isEditing={isEditing} onChange={handleChange} as="select" options={['Mr.', 'Mrs.', 'Ms.', 'Dr.']} />
                    <EditableField label="Prenume" name="firstName" value={data.firstName} isEditing={isEditing} onChange={handleChange} />
                    <EditableField label="Nume de Familie" name="lastName" value={data.lastName} isEditing={isEditing} onChange={handleChange} />
                    <EditableField label="Dată Naștere" name="dob" value={data.dob} isEditing={isEditing} onChange={handleChange} type="date" />
                    <EditableField label="Gen" name="gender" value={data.gender} isEditing={isEditing} onChange={handleChange} as="select" options={['Male', 'Female', 'Other']} />
                    <EditableField label="Ocupație" name="occupation" value={data.occupation} isEditing={isEditing} onChange={handleChange} />
                </DetailSection>

                {memberCustomFields.length > 0 && (
                    <DetailSection title="Atribute Personalizate">
                        {memberCustomFields.map(field => (
                            <EditableField 
                                key={field.id}
                                label={field.label}
                                name={field.id}
                                value={data.customFields?.[field.id]}
                                isEditing={isEditing}
                                onChange={handleChange}
                                // FIX: correctly handled 'text' as a valid value for the 'as' prop.
                                as={field.type === 'select' ? 'select' : field.type === 'boolean' ? 'checkbox' : field.type === 'text' ? 'text' : undefined}
                                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                options={field.options}
                            />
                        ))}
                    </DetailSection>
                )}

                <DetailSection title="Date Contact & Adresă">
                    <EditableField label="Email" name="email" value={data.email} isEditing={isEditing} onChange={handleChange} type="email" />
                    <EditableField label="Telefon" name="phone" value={data.phone} isEditing={isEditing} onChange={handleChange} type="tel" />
                    <EditableField label="Adresă" name="address.line1" value={data.address?.line1} isEditing={isEditing} onChange={handleChange} />
                    <EditableField label="Oraș" name="address.city" value={data.address?.city} isEditing={isEditing} onChange={handleChange} />
                </DetailSection>

                <DetailSection title="Contact Urgență">
                    <EditableField label="Nume Contact" name="emergencyContact.name" value={data.emergencyContact?.name} isEditing={isEditing} onChange={handleChange} />
                    <EditableField label="Relație" name="emergencyContact.relationship" value={data.emergencyContact?.relationship} isEditing={isEditing} onChange={handleChange} />
                    <EditableField label="Telefon Urgență" name="emergencyContact.cell" value={data.emergencyContact?.cell} isEditing={isEditing} onChange={handleChange} type="tel"/>
                </DetailSection>

                <DetailSection title="Marketing & Sursă">
                    <EditableField label="Reprezentant Vânzări" name="salesRep" value={data.salesRep} isEditing={isEditing} onChange={handleChange} as="select" options={salesReps} />
                    <EditableField label="Sursă Promovare" name="sourcePromotion" value={data.sourcePromotion} isEditing={isEditing} onChange={handleChange} as="select" options={sourcePromotions} />
                    <EditableField label="Recomandat de" name="referredBy" value={data.referredBy} isEditing={isEditing} onChange={handleChange} placeholder="Nume membru..." />
                    <EditableField label="Antrenor Alocat" name="trainer" value={data.trainer} isEditing={isEditing} onChange={handleChange} as="select" options={trainers} />
                </DetailSection>
            </div>
        </div>
    );
};

export default DetailsTab;
