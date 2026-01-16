import React, { useState } from 'react';
import * as Icons from '../icons';

const BookingClassesSettings: React.FC = () => {
    const [settings, setSettings] = useState({
        allowOnlineBookings: true,
        bookingWindowDays: 30,
        cancellationPolicyHours: 24,
        autoConfirmBookings: true,
        sendBookingReminders: true,
        reminderTimeHours: 48,
    });

    const handleToggle = (key: keyof typeof settings) => {
        // @ts-ignore
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; description: string }> = ({ label, enabled, onToggle, description }) => (
        <div className="flex items-center justify-between py-4 border-b border-border-dark">
            <div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-text-dark-secondary">{description}</p>
            </div>
            <button onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-background-dark border border-border-dark'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    const NumberInput: React.FC<{ label: string; name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; description: string; unit: string }> = ({ label, name, value, onChange, description, unit }) => (
        <div className="flex items-center justify-between py-4 border-b border-border-dark">
            <div>
                 <p className="font-semibold">{label}</p>
                 <p className="text-sm text-text-dark-secondary">{description}</p>
            </div>
            <div className="flex items-center">
                 <input type="number" name={name} value={value} onChange={onChange} className="p-2 w-24 bg-background-dark rounded-md text-right border border-border-dark" />
                 <span className="ml-2 text-sm text-text-dark-secondary">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Booking & Classes Settings</h1>
            <p className="text-text-dark-secondary mt-1 mb-8">Manage how members can book classes and services.</p>

            <div className="bg-card-dark rounded-lg shadow-md">
                <div className="p-6">
                    <Toggle 
                        label="Allow Online Bookings"
                        enabled={settings.allowOnlineBookings}
                        onToggle={() => handleToggle('allowOnlineBookings')}
                        description="Allow members to book classes and services through the member portal."
                    />
                     <Toggle 
                        label="Auto-confirm Bookings"
                        enabled={settings.autoConfirmBookings}
                        onToggle={() => handleToggle('autoConfirmBookings')}
                        description="Automatically confirm bookings, or require manual staff approval."
                    />
                    <NumberInput 
                        label="Booking Window"
                        name="bookingWindowDays"
                        value={settings.bookingWindowDays}
                        onChange={handleChange}
                        description="How many days in advance members can book."
                        unit="days"
                    />
                    <NumberInput 
                        label="Cancellation Policy"
                        name="cancellationPolicyHours"
                        value={settings.cancellationPolicyHours}
                        onChange={handleChange}
                        description="Minimum notice required for a member to cancel without penalty."
                        unit="hours"
                    />
                     <Toggle 
                        label="Send Booking Reminders"
                        enabled={settings.sendBookingReminders}
                        onToggle={() => handleToggle('sendBookingReminders')}
                        description="Send automated email or SMS reminders for upcoming bookings."
                    />
                    <NumberInput 
                        label="Reminder Time"
                        name="reminderTimeHours"
                        value={settings.reminderTimeHours}
                        onChange={handleChange}
                        description="How long before the booking to send the reminder."
                        unit="hours"
                    />
                </div>
                <div className="bg-background-dark p-4 rounded-b-lg flex justify-end">
                    <button className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingClassesSettings;
