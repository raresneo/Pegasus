
import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { membershipTiers } from '../lib/data';
import * as Icons from '../components/icons';
import { Member, MembershipTier } from '../types';

type WizardStep = 'profile' | 'membership' | 'address' | 'emergency' | 'review';

const STEPS: { id: WizardStep; label: string; icon: React.FC<any> }[] = [
    { id: 'profile', label: 'Profil', icon: Icons.UserCircleIcon },
    { id: 'membership', label: 'Abonament', icon: Icons.TicketIcon },
    { id: 'address', label: 'Localizare', icon: Icons.MapPinIcon },
    { id: 'emergency', label: 'Urgență', icon: Icons.ShieldCheckIcon },
    { id: 'review', label: 'Confirmare', icon: Icons.CheckCircleIcon },
];

const initialFormData: Omit<Member, 'id' | 'joinDate' | 'avatar' | 'membership' | 'locationId'> = {
    memberType: 'member',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'România' },
    occupation: '',
    organization: '',
    involvementType: 'Member',
    tags: [],
    salesRep: 'Administrator',
    sourcePromotion: 'Unknown',
    referredBy: '',
    trainer: '',
    emergencyContact: { name: '', relationship: '', cell: '', email: '' }
};

const MembershipCard: React.FC<{ tier: MembershipTier; isSelected: boolean; onSelect: () => void; }> = ({ tier, isSelected, onSelect }) => (
    <div 
        onClick={onSelect} 
        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative group ${
            isSelected 
            ? 'border-primary-500 bg-primary-500/5 shadow-lg' 
            : 'border-border-light dark:border-border-dark hover:border-primary-400 bg-white dark:bg-card-dark'
        }`}
    >
        {tier.popular && (
            <div className="absolute -top-3 right-4 bg-primary-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Popular
            </div>
        )}
        <h3 className="font-black text-sm uppercase tracking-tighter mb-1">{tier.name}</h3>
        <p className="text-2xl font-black text-primary-500">{tier.price} <span className="text-xs opacity-60 font-bold uppercase">RON</span></p>
        <p className="text-[10px] font-bold opacity-40 uppercase mt-2">
            {tier.billingCycle === 'monthly' ? 'Recurență Lunară' : 'Recurență Anuală'}
        </p>
    </div>
);

const AddMemberPage: React.FC = () => {
    const { addMember, addPayment } = useDatabase();
    const [currentStep, setCurrentStep] = useState<WizardStep>('profile');
    const [formData, setFormData] = useState(initialFormData);
    const [selectedTierId, setSelectedTierId] = useState<string>(membershipTiers[0].id);
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Other'>('Card');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const stepIndex = STEPS.findIndex(s => s.id === currentStep);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: { ...(prev[section as keyof typeof prev] as object), [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 'profile':
                return formData.firstName && formData.lastName && formData.email && formData.phone;
            case 'membership':
                return !!selectedTierId;
            case 'address':
                return formData.address.city && formData.address.line1;
            case 'emergency':
                return formData.emergencyContact.name && formData.emergencyContact.cell;
            default:
                return true;
        }
    };

    const nextStep = () => {
        const nextIdx = stepIndex + 1;
        if (nextIdx < STEPS.length) setCurrentStep(STEPS[nextIdx].id);
    };

    const prevStep = () => {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) setCurrentStep(STEPS[prevIdx].id);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const joinDate = new Date();
            const newMember = addMember(formData, selectedTierId, joinDate);
            const tier = membershipTiers.find(t => t.id === selectedTierId);
            
            if (tier) {
                addPayment({
                    memberId: newMember.id,
                    locationId: 'loc_central',
                    amount: tier.price,
                    date: joinDate.toISOString(),
                    description: `Taxă înscriere inițială: ${tier.name}`,
                    method: paymentMethod
                });
            }
            
            setIsDone(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isDone) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center animate-scaleIn">
                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20">
                    <Icons.CheckCircleIcon className="w-16 h-16" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-text-light-primary dark:text-text-dark-primary">Membru Adăugat!</h1>
                <p className="text-lg text-text-light-secondary dark:text-text-dark-secondary mb-10 font-medium">
                    {formData.firstName} {formData.lastName} a fost înregistrat cu succes și abonamentul a fost activat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => { setIsDone(false); setFormData(initialFormData); setCurrentStep('profile'); }}
                        className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-primary-600 transition-all active:scale-95"
                    >
                        Înregistrează alt membru
                    </button>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-10 py-4 bg-gray-100 dark:bg-card-dark text-text-light-primary dark:text-text-dark-primary rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-gray-200"
                    >
                        Mergi la Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn">
            {/* Wizard Header / Indicator Progres */}
            <div className="mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-border-dark -z-10"></div>
                    {STEPS.map((step, idx) => {
                        const isPast = idx < stepIndex;
                        const isCurrent = idx === stepIndex;
                        return (
                            <div key={step.id} className="flex flex-col items-center bg-background-light dark:bg-background-dark px-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                                    isCurrent ? 'bg-primary-500 border-primary-500 text-white shadow-xl scale-110' : 
                                    isPast ? 'bg-green-500 border-green-500 text-white' : 
                                    'bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-gray-400'
                                }`}>
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-primary-500' : 'text-text-light-secondary opacity-40'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content Card */}
            <div className="bg-white dark:bg-card-dark rounded-[3rem] border border-border-light dark:border-border-dark shadow-sm p-8 md:p-12">
                
                {currentStep === 'profile' && (
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="border-l-4 border-primary-500 pl-6 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Informații Identitate</h2>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary opacity-60 font-medium">Introdu datele de bază ale noului membru.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Prenume" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="ex: Ion" />
                            <InputField label="Nume" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="ex: Popescu" />
                            <InputField label="Email Personal" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="ion.popescu@gmail.com" />
                            <InputField label="Telefon Mobil" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="07xx xxx xxx" />
                            <InputField label="Dată Naștere" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-60 mb-2 ml-1">Gen</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500">
                                    <option value="Male">Masculin</option>
                                    <option value="Female">Feminin</option>
                                    <option value="Other">Altul</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'membership' && (
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="border-l-4 border-primary-500 pl-6 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Selecție Abonament</h2>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary opacity-60 font-medium">Alege planul de acces și metoda de plată pentru prima lună.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {membershipTiers.map(tier => (
                                <MembershipCard 
                                    key={tier.id} 
                                    tier={tier} 
                                    isSelected={selectedTierId === tier.id} 
                                    onSelect={() => setSelectedTierId(tier.id)} 
                                />
                            ))}
                        </div>
                        <div className="pt-8 border-t border-border-light dark:border-border-dark">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-60 mb-4 ml-1">Metodă încasare taxă înscriere</label>
                            <div className="flex gap-4">
                                {['Card', 'Cash', 'Other'].map(m => (
                                    <button 
                                        key={m} 
                                        type="button"
                                        onClick={() => setPaymentMethod(m as any)}
                                        className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                                            paymentMethod === m 
                                            ? 'border-primary-500 bg-primary-500 text-white shadow-lg' 
                                            : 'border-border-light dark:border-border-dark hover:border-primary-300 dark:text-white'
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'address' && (
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="border-l-4 border-primary-500 pl-6 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Locație & Marketing</h2>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary opacity-60 font-medium">Datele de rezidență și sursa lead-ului.</p>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="Adresă (Stradă, Nr)" name="address.line1" value={formData.address.line1} onChange={handleChange} required placeholder="ex: Str. Victoriei, Nr. 1" />
                                <InputField label="Oraș" name="address.city" value={formData.address.city} onChange={handleChange} required placeholder="ex: București" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-60 mb-2 ml-1">Sursă Promovare</label>
                                    <select name="sourcePromotion" value={formData.sourcePromotion} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value="Unknown">Necunoscut / Organic</option>
                                        <option value="Facebook">Facebook Ads</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Google">Google Search</option>
                                        <option value="Referral">Recomandare Prieten</option>
                                        <option value="Outdoor">Outdoor / Flyer</option>
                                    </select>
                                </div>
                                <InputField label="Ocupație / Job" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="ex: Software Engineer" />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'emergency' && (
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="border-l-4 border-primary-500 pl-6 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Contact Situații de Urgență</h2>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary opacity-60 font-medium">Informații critice necesare în caz de incident medical.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Nume Persoană Contact" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} required placeholder="ex: Maria Popescu" />
                            <InputField label="Relație (ex: Mamă, Soț)" name="emergencyContact.relationship" value={formData.emergencyContact.relationship} onChange={handleChange} placeholder="ex: Partener" />
                            <InputField label="Telefon de Urgență" name="emergencyContact.cell" value={formData.emergencyContact.cell} onChange={handleChange} required placeholder="07xx xxx xxx" />
                            <InputField label="Email Contact (Opțional)" name="emergencyContact.email" value={formData.emergencyContact.email} onChange={handleChange} placeholder="email@contact.com" />
                        </div>
                    </div>
                )}

                {currentStep === 'review' && (
                    <div className="space-y-8 animate-fadeInUp">
                        <div className="border-l-4 border-primary-500 pl-6 mb-8">
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Verificare Finală</h2>
                            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary opacity-60 font-medium">Asigură-te că toate datele sunt corecte înainte de salvare.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 border-b border-border-light dark:border-border-dark pb-2 mb-3">Profil & Contact</h4>
                                    <p className="text-xl font-black text-text-light-primary dark:text-text-dark-primary">{formData.firstName} {formData.lastName}</p>
                                    <p className="text-sm font-bold opacity-60">{formData.email}</p>
                                    <p className="text-sm font-bold opacity-60">{formData.phone}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 border-b border-border-light dark:border-border-dark pb-2 mb-3">Localizare</h4>
                                    <p className="text-sm font-bold">{formData.address.line1}, {formData.address.city}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 border-b border-border-light dark:border-border-dark pb-2 mb-3">Abonament & Plată</h4>
                                    <p className="text-xl font-black text-text-light-primary dark:text-text-dark-primary">
                                        {membershipTiers.find(t => t.id === selectedTierId)?.name}
                                    </p>
                                    <p className="text-sm font-bold text-green-500 uppercase tracking-widest mt-1">Metodă: {paymentMethod}</p>
                                </div>
                                <div className="p-6 bg-primary-500/5 rounded-3xl border border-primary-500/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icons.ShieldCheckIcon className="w-5 h-5 text-primary-500" />
                                        <p className="text-xs font-black uppercase tracking-tight">GDPR & Politici</p>
                                    </div>
                                    <p className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary leading-relaxed">
                                        Membru confirmă acordul pentru procesarea datelor și acceptă regulamentul intern al clubului Fitable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wizard Footer Controls */}
                <div className="mt-12 pt-10 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                    <button 
                        onClick={prevStep}
                        disabled={stepIndex === 0 || isSubmitting}
                        className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                            stepIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-text-light-secondary hover:bg-gray-100 dark:hover:bg-background-dark dark:text-white'
                        }`}
                    >
                        Înapoi
                    </button>

                    <div className="flex gap-4">
                        {currentStep === 'review' ? (
                            <button 
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.CheckCircleIcon className="w-5 h-5" />}
                                Finalizează Înscrierea
                            </button>
                        ) : (
                            <button 
                                onClick={nextStep}
                                disabled={!isStepValid()}
                                className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-600 transition-all disabled:opacity-30 flex items-center gap-3 active:scale-95"
                            >
                                Pasul Următor
                                <Icons.ChevronRightIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, required, type = "text", placeholder }) => (
    <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-widest text-text-light-secondary opacity-60 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            placeholder={placeholder}
            className="w-full p-4 bg-gray-50 dark:bg-background-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" 
        />
    </div>
);

export default AddMemberPage;
