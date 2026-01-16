
import React, { useState, useMemo } from 'react';
import { MembershipTier, Payment } from '../types';
import { membershipTiers } from '../lib/data';
import * as Icons from '../components/icons';
import { useDatabase } from '../context/DatabaseContext';
import StripePaymentModal from '../components/StripePaymentModal';

const MembershipCard: React.FC<{
    tier: MembershipTier;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ tier, isSelected, onSelect }) => {
    const cardClasses = `border-2 rounded-[2rem] p-8 cursor-pointer transition-all duration-500 relative ${
        isSelected ? 'border-primary-500 bg-primary-500/5 shadow-2xl scale-[1.02]' : 'bg-white dark:bg-card-dark border-border-light dark:border-border-dark hover:border-primary-400 hover:shadow-lg'
    }`;

    return (
        <div className={cardClasses} onClick={onSelect}>
            {tier.popular && (
                <div className="absolute top-0 right-8 -mt-3 bg-primary-500 text-white text-[10px] font-black tracking-widest px-4 py-1 rounded-full uppercase shadow-lg">
                    Recomandat
                </div>
            )}
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{tier.name}</h3>
            <p className="text-4xl font-black text-primary-500 mb-6">
                {tier.price.toLocaleString()} <span className="text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest">RON / {tier.billingCycle === 'monthly' ? 'lună' : 'an'}</span>
            </p>
            <ul className="space-y-3 text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-tight">
                {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                        <Icons.CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const MembershipSignUpPage: React.FC = () => {
    const { addMember, addPayment, onlineHubSettings } = useDatabase();
    const [selectedTierId, setSelectedTierId] = useState<string | null>(membershipTiers.find(t => t.popular)?.id || null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isStripeOpen, setIsStripeOpen] = useState(false);
    
    const selectedTier = useMemo(() => {
        return membershipTiers.find(t => t.id === selectedTierId);
    }, [selectedTierId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyDiscount = () => {
        if (discountCode.toUpperCase() === 'FITABLE10') {
            setDiscountApplied(true);
        } else {
            setDiscountApplied(false);
            alert('Cod invalid.');
        }
    };
    
    const subtotal = selectedTier?.price ?? 0;
    const discountAmount = discountApplied ? subtotal * 0.10 : 0;
    const total = subtotal - discountAmount;

    const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone && selectedTierId && agreedToTerms;

    const finalizeSignup = (stripeRef?: string) => {
        if (!selectedTier) return;
        const joinDate = new Date();

        // FIX: Added missing gender property required by DatabaseContext's addMember function.
        const newMember = addMember({
            memberType: 'member',
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            gender: 'Other',
            dob: '1900-01-01', 
            address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Romania' },
            emergencyContact: { name: '', relationship: '', cell: '', email: '' },
        }, selectedTier.id, joinDate);
        
        addPayment({
            memberId: newMember.id,
            locationId: newMember.locationId,
            amount: total,
            date: joinDate.toISOString(),
            description: `Abonare Online: ${selectedTier.name}`,
            method: stripeRef ? 'Stripe' : 'Other',
            stripeRef: stripeRef
        });

        setFormSubmitted(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || !selectedTier) return;

        if (onlineHubSettings.stripe.enabled) {
            setIsStripeOpen(true);
        } else {
            finalizeSignup();
        }
    };

    if (formSubmitted) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex items-center justify-center p-6">
                <div className="bg-white dark:bg-card-dark rounded-[3rem] shadow-2xl p-12 text-center max-w-lg animate-scaleIn border border-border-light dark:border-border-dark">
                    <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
                        <Icons.CheckCircleIcon className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Bun venit, {formData.firstName}!</h1>
                    <p className="text-lg font-medium text-text-light-secondary dark:text-text-dark-secondary mb-10 leading-relaxed">
                        Abonamentul tău este activ. Verifică email-ul pentru detalii despre prima vizită și regulamentul clubului.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="px-10 py-5 bg-primary-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-primary-600 shadow-xl shadow-primary-500/20 transition-all active:scale-95">
                        Mergi la Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background-dark py-20 px-4">
            <StripePaymentModal 
                isOpen={isStripeOpen}
                onClose={() => setIsStripeOpen(false)}
                amount={total}
                description={`Abonament Fitable - ${selectedTier?.name}`}
                onSuccess={(ref) => finalizeSignup(ref)}
            />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="bg-primary-500 inline-block p-3 rounded-2xl shadow-lg mb-4">
                        <Icons.LogoIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase text-text-light-primary dark:text-text-dark-primary">Începe Transformarea</h1>
                    <p className="text-xl font-medium text-text-light-secondary dark:text-text-dark-secondary">Înregistrare rapidă în comunitatea Fitable.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                                Alege Planul Tău
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {membershipTiers.map(tier => (
                                    <MembershipCard
                                        key={tier.id}
                                        tier={tier}
                                        isSelected={selectedTierId === tier.id}
                                        onSelect={() => setSelectedTierId(tier.id)}
                                    />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                                <span className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                                Datele Tale
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Prenume</label>
                                    <input type="text" name="firstName" placeholder="Alex" value={formData.firstName} onChange={handleInputChange} required className="w-full p-4 bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Nume</label>
                                    <input type="text" name="lastName" placeholder="Enache" value={formData.lastName} onChange={handleInputChange} required className="w-full p-4 bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Email Personal</label>
                                    <input type="email" name="email" placeholder="alex@exemplu.ro" value={formData.email} onChange={handleInputChange} required className="w-full p-4 bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Număr Telefon</label>
                                    <input type="tel" name="phone" placeholder="07XX XXX XXX" value={formData.phone} onChange={handleInputChange} required className="w-full p-4 bg-white dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-card-dark p-8 rounded-[2.5rem] border border-border-light dark:border-border-dark shadow-sm">
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Termeni și Condiții</h2>
                            <div className="h-32 p-4 bg-gray-50 dark:bg-background-dark rounded-xl overflow-y-auto text-xs text-text-light-secondary dark:text-text-dark-secondary italic leading-relaxed">
                                <p>Prin finalizarea înscrierii, accepți regulamentul intern al sălii Fitable. Abonamentul se activează imediat după confirmarea plății. Rezilierea se poate face cu un preaviz de 30 de zile pentru planurile lunare.</p>
                            </div>
                            <label className="flex items-center mt-6 cursor-pointer group">
                                <input type="checkbox" checked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} required className="h-6 w-6 rounded-lg border-gray-300 text-primary-500 focus:ring-primary-500" />
                                <span className="ml-4 text-sm font-bold uppercase tracking-tight group-hover:text-primary-500 transition-colors">Am citit și sunt de acord cu T&C</span>
                            </label>
                        </section>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] border border-border-light dark:border-border-dark shadow-2xl p-8 sticky top-12 space-y-8">
                            <h3 className="text-2xl font-black uppercase tracking-tighter border-b border-border-light dark:border-border-dark pb-6">Rezumat Comandă</h3>
                            
                            {!selectedTier ? (
                                <p className="text-sm text-text-light-secondary opacity-50 italic">Te rugăm să selectezi un plan de antrenament.</p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <p className="text-xs font-black uppercase tracking-widest text-primary-500">Plan Selectat</p>
                                        <p className="text-2xl font-black">{selectedTier.name}</p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-border-light dark:border-border-dark">
                                        <div className="flex gap-2">
                                            <input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Cod Reducere" className="flex-1 p-3 bg-gray-50 dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none uppercase" />
                                            <button type="button" onClick={handleApplyDiscount} className="px-6 py-3 bg-gray-100 dark:bg-background-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Aplică</button>
                                        </div>
                                        {discountApplied && (
                                            <p className="text-green-500 text-xs font-black uppercase tracking-tighter animate-fadeIn">Cod FITABLE10 aplicat! (-10%)</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-3 pt-6 border-t border-border-light dark:border-border-dark">
                                        <div className="flex justify-between text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span>{subtotal.toFixed(2)} RON</span>
                                        </div>
                                        {discountApplied && (
                                            <div className="flex justify-between text-xs font-bold text-green-500 uppercase tracking-widest">
                                                <span>Discount</span>
                                                <span>-{discountAmount.toFixed(2)} RON</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-black text-3xl pt-2">
                                            <span className="uppercase tracking-tighter">Total</span>
                                            <span className="text-primary-500">{total.toFixed(2)} RON</span>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={!isFormValid}
                                        className="w-full bg-primary-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                    >
                                        {onlineHubSettings.stripe.enabled ? 'Plătește Securizat cu Cardul' : 'Finalizează Înscrierea'}
                                    </button>
                                    
                                    <div className="flex items-center justify-center gap-4 opacity-30 grayscale pt-4">
                                        <Icons.ShieldCheckIcon className="w-6 h-6" />
                                        <Icons.CreditCardIcon className="w-6 h-6" />
                                        <span className="text-[10px] font-black uppercase">PCI DSS Compliant</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MembershipSignUpPage;
