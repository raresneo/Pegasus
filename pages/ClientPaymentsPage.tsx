import React, { useMemo, useState } from 'react';
import { Member } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import {
    CreditCardIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ClientPaymentsPageProps {
    member: Member;
    onBack: () => void;
}

const ClientPaymentsPage: React.FC<ClientPaymentsPageProps> = ({ member, onBack }) => {
    const { payments } = useDatabase();
    const [filterMonth, setFilterMonth] = useState<Date>(new Date());

    const memberPayments = useMemo(() => {
        return payments
            .filter(p => p.memberId === member.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments, member.id]);

    const filteredPayments = useMemo(() => {
        const monthStart = startOfMonth(filterMonth);
        const monthEnd = endOfMonth(filterMonth);

        return memberPayments.filter(p =>
            isWithinInterval(new Date(p.date), { start: monthStart, end: monthEnd })
        );
    }, [memberPayments, filterMonth]);

    const stats = useMemo(() => {
        const totalSpent = memberPayments
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + p.amount, 0);

        const thisMonthSpent = filteredPayments
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + p.amount, 0);

        const pending = memberPayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        return {
            total: totalSpent,
            thisMonth: thisMonthSpent,
            pending: pending,
            count: memberPayments.filter(p => p.status === 'succeeded').length
        };
    }, [memberPayments, filteredPayments]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'pending':
                return <ClockIcon className="w-5 h-5 text-yellow-400" />;
            case 'failed':
                return <XCircleIcon className="w-5 h-5 text-red-400" />;
            default:
                return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            succeeded: 'Reușit',
            pending: 'În așteptare',
            failed: 'Eșuat'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            succeeded: 'bg-green-500/20 text-green-400 border-green-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            failed: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return colors[status] || colors.succeeded;
    };

    const getPaymentMethodIcon = (method?: string) => {
        return <CreditCardIcon className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Plăți & Facturi</h1>
                    <p className="text-gray-400">Istoric plăți și informații financiare</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    ← Înapoi
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 rounded-xl border border-primary-600/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <ChartBarIcon className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.total.toFixed(2)} RON</h3>
                    <p className="text-sm text-gray-400">Total Plătit</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <CreditCardIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.thisMonth.toFixed(2)} RON</h3>
                    <p className="text-sm text-gray-400">Luna Aceasta</p>
                </div>

                <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <ClockIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.pending.toFixed(2)} RON</h3>
                    <p className="text-sm text-gray-400">În Așteptare</p>
                </div>

                <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stats.count}</h3>
                    <p className="text-sm text-gray-400">Tranzacții</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-white font-medium">Filtrează după lună:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setFilterMonth(new Date(filterMonth.getFullYear(), filterMonth.getMonth() - 1, 1))}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            ←
                        </button>
                        <span className="text-white font-semibold min-w-[150px] text-center">
                            {format(filterMonth, 'MMMM yyyy', { locale: ro })}
                        </span>
                        <button
                            onClick={() => setFilterMonth(new Date(filterMonth.getFullYear(), filterMonth.getMonth() + 1, 1))}
                            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            disabled={filterMonth >= new Date()}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Istoric Plăți</h2>
                </div>
                {filteredPayments.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {filteredPayments.map(payment => (
                            <div
                                key={payment.id}
                                className="p-6 hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            {getStatusIcon(payment.status)}
                                            <h3 className="text-lg font-semibold text-white">{payment.description}</h3>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center">
                                                <CreditCardIcon className="w-4 h-4 mr-2" />
                                                {payment.method || 'N/A'}
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="w-4 h-4 mr-2" />
                                                {format(new Date(payment.date), 'd MMMM yyyy, HH:mm', { locale: ro })}
                                            </div>
                                            {payment.stripeRef && (
                                                <div className="text-xs text-gray-500">
                                                    Ref: {payment.stripeRef}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <div className="text-2xl font-bold text-white">
                                            {payment.amount.toFixed(2)} RON
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                                            {getStatusLabel(payment.status)}
                                        </span>
                                        {payment.status === 'succeeded' && (
                                            <button className="flex items-center text-sm text-primary-400 hover:text-primary-300 transition-colors">
                                                <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                                                Descarcă Factură
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CreditCardIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">Nu există plăți pentru această lună</p>
                    </div>
                )}
            </div>

            {/* All Payments Summary */}
            {memberPayments.length > filteredPayments.length && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <p className="text-sm text-gray-400 text-center">
                        Se afișează {filteredPayments.length} din {memberPayments.length} plăți totale
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClientPaymentsPage;
