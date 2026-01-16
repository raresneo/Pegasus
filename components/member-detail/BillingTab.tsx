
import React, { useState, useMemo } from 'react';
import { Member, Payment } from '../../types';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import FormModal from '../FormModal';

interface BillingTabProps {
    member: Member;
}

const StatusChip: React.FC<{ status: 'Charged' | 'Paid' | 'Voided' | 'Adjustment' }> = ({ status }) => {
    const color = status === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300';
    return <span className={`font-medium ${color}`}>{status}</span>
}

const BillingTab: React.FC<BillingTabProps> = ({ member }) => {
    const { payments, addPayment, addPrepayment, addBillingAdjustment } = useDatabase();
    const [debtCollection, setDebtCollection] = useState(member.debtCollection || { maxAmountToBill: 0, deadline: '', isBadDebtor: false, isBlacklisted: false });
    const [isPrepayOpen, setIsPrepayOpen] = useState(false);
    const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
    const [isMakePaymentOpen, setIsMakePaymentOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [prepayAmount, setPrepayAmount] = useState('');
    const [prepayMethod, setPrepayMethod] = useState<'Card' | 'Cash' | 'Other'>('Card');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Other'>('Card');
    
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('Goodwill Credit');
    const adjustmentReasons = ['Goodwill Credit', 'Correction (Debit)', 'Correction (Credit)', 'Service Fee', 'Other'];

    const memberPayments = useMemo(() => 
        payments.filter(p => p.memberId === member.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    , [payments, member.id]);
    
    const { accountHistory, currentBalance } = useMemo(() => {
        let runningBalance = 0;
        const history = memberPayments.map(p => {
            runningBalance += p.amount;
            return { id: p.id, date: new Date(p.date).toLocaleDateString(), description: p.description, status: p.amount > 0 ? 'Paid' : 'Charged', charged: p.amount < 0 ? Math.abs(p.amount) : 0, paid: p.amount > 0 ? p.amount : 0, balance: runningBalance };
        });
        return { accountHistory: history.reverse(), currentBalance: runningBalance };
    }, [memberPayments]);

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handlePrepaySubmit = () => {
        const amount = parseFloat(prepayAmount);
        if (amount > 0) {
            addPrepayment(member.id, amount, prepayMethod);
            setIsPrepayOpen(false);
            setPrepayAmount('');
            showSuccessMessage('Prepayment added successfully!');
        }
    };
    
    const handleMakePaymentSubmit = () => {
        const amount = parseFloat(paymentAmount);
        if (amount > 0) {
            // FIX: Added required locationId property from the member object.
            addPayment({ 
                memberId: member.id, 
                locationId: member.locationId,
                amount, 
                date: new Date().toISOString(), 
                description: `Payment Received`, 
                method: paymentMethod 
            });
            setIsMakePaymentOpen(false);
            setPaymentAmount('');
            showSuccessMessage('Payment recorded successfully!');
        }
    };

    const handleAdjustmentSubmit = () => {
        const amount = parseFloat(adjustmentAmount);
        if (adjustmentAmount && !isNaN(amount)) {
            addBillingAdjustment(member.id, amount, adjustmentReason);
            setIsAdjustmentOpen(false);
            setAdjustmentAmount('');
            showSuccessMessage('Adjustment applied successfully!');
        }
    };
    
    const mockInvoices = [{ id: 'INV-001', date: '29 Oct 2025', amount: 730.00, status: 'Paid' }, { id: 'INV-002', date: '29 Sep 2025', amount: 730.00, status: 'Voided' }];

    return (
        <div className="relative">
            {successMessage && (<div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fadeIn"><p>{successMessage}</p></div>)}

            <FormModal isOpen={isMakePaymentOpen} onClose={() => setIsMakePaymentOpen(false)} title="Make a Payment">
                <div className="space-y-4">
                    <p>Outstanding Balance: <span className="font-bold text-red-400">Lei {currentBalance.toFixed(2)}</span></p>
                    <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Payment Amount</label><input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder={Math.abs(currentBalance).toFixed(2)} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/></div>
                    <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Payment Method</label><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"><option>Card</option><option>Cash</option><option>Other</option></select></div>
                </div>
                <div className="mt-6 flex justify-end gap-2"><button onClick={() => setIsMakePaymentOpen(false)} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button><button onClick={handleMakePaymentSubmit} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Record Payment</button></div>
            </FormModal>

            {/* Other modals (prepay, adjustment) here... */}

            <div className="space-y-8">
                {currentBalance < 0 && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Icons.ShieldExclamationIcon className="w-8 h-8 text-red-400" />
                            <div>
                                <h4 className="font-bold text-red-300">Outstanding Balance</h4>
                                <p className="text-sm text-red-400">This member has a debt of Lei {Math.abs(currentBalance).toFixed(2)}.</p>
                            </div>
                        </div>
                        <button onClick={() => { setPaymentAmount(Math.abs(currentBalance).toFixed(2)); setIsMakePaymentOpen(true); }} className="bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary-600 w-full sm:w-auto">Make Payment</button>
                    </div>
                )}
                <section>
                    <h3 className="text-lg font-semibold mb-4">Account History</h3>
                    {/* ... Account history table ... */}
                    <div className="overflow-x-auto rounded-lg border border-border-dark">
                        <table className="w-full text-sm text-left text-text-dark-secondary">
                            <thead className="text-xs uppercase bg-background-dark"><tr className="border-b border-border-dark"><th className="px-6 py-3">Date</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Charged</th><th className="px-6 py-3 text-right">Paid</th><th className="px-6 py-3 text-right">Balance</th></tr></thead>
                            <tbody>
                                {accountHistory.map((item) => (
                                    <tr key={item.id} className="bg-card-dark border-b border-border-dark last:border-b-0">
                                        <td className="px-6 py-4">{item.date}</td><td className="px-6 py-4">{item.description}</td><td className="px-6 py-4"><StatusChip status={item.status as any} /></td><td className="px-6 py-4 text-right">Lei {item.charged.toFixed(2)}</td><td className="px-6 py-4 text-right">Lei {item.paid.toFixed(2)}</td><td className="px-6 py-4 text-right font-semibold">Lei {item.balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BillingTab;
