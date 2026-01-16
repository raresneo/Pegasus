import React, { useState } from 'react';
import * as Icons from '../icons';

const FinancialConfigSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        currency: 'USD',
        taxRate: 10,
        invoicePrefix: 'INV-',
        acceptCash: true,
        acceptCard: true,
        acceptBankTransfer: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setSettings(prev => ({ ...prev, [name]: val }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-text-light-primary dark:text-text-dark-primary">Financial Configuration</h1>
            <p className="text-text-light-secondary dark:text-text-dark-secondary mb-8">Configure tax rates, currencies, and accepted payment methods.</p>

            <div className="bg-white dark:bg-card-dark rounded-lg shadow-md border border-border-light dark:border-border-dark p-6 space-y-6">
                <h3 className="text-lg font-semibold border-b border-border-light dark:border-border-dark pb-2 text-text-light-primary dark:text-text-dark-primary">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Currency</label>
                        <select name="currency" value={settings.currency} onChange={handleChange} className="p-2.5 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="RON">RON (Lei)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Default Tax Rate (%)</label>
                        <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} className="p-2.5 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">Invoice Number Prefix</label>
                        <input type="text" name="invoicePrefix" value={settings.invoicePrefix} onChange={handleChange} className="p-2.5 w-full bg-gray-50 dark:bg-background-dark rounded-md border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary" />
                    </div>
                </div>

                <h3 className="text-lg font-semibold border-b border-border-light dark:border-border-dark pb-2 pt-4 text-text-light-primary dark:text-text-dark-primary">Payment Methods</h3>
                <div className="space-y-3">
                    {[
                        { key: 'acceptCash', label: 'Accept Cash Payments' },
                        { key: 'acceptCard', label: 'Accept Card Payments' },
                        { key: 'acceptBankTransfer', label: 'Accept Bank Transfers' },
                    ].map(method => (
                        <label key={method.key} className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-background-dark cursor-pointer border border-border-light dark:border-border-dark">
                            <input type="checkbox" name={method.key} checked={settings[method.key as keyof typeof settings] as boolean} onChange={handleChange} className="h-5 w-5 rounded text-primary-500 bg-white dark:bg-card-dark border-border-light dark:border-border-dark" />
                            <span className="font-medium text-text-light-primary dark:text-text-dark-primary">{method.label}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button className="px-6 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 font-medium">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default FinancialConfigSettings;