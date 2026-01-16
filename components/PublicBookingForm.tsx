import React, { useState, useMemo } from 'react';
import { Resource } from '../types';
import * as Icons from './icons';

interface PublicBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string, email: string, phone: string }) => void;
  slotData: { startTime: Date, resourceId: string } | null;
  resources: Resource[];
}

const PublicBookingForm: React.FC<PublicBookingFormProps> = ({ isOpen, onClose, onSubmit, slotData, resources }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resourceName = useMemo(() => {
    return resources.find(r => r.id === slotData?.resourceId)?.name || 'the gym';
  }, [slotData, resources]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onSubmit(formData);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', phone: '' });
        onClose();
      }, 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        {isSubmitted ? (
            <div className="text-center p-8">
                <Icons.CheckCircleIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Thank You!</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Your booking request has been received. We will contact you shortly to confirm.</p>
            </div>
        ) : (
            <>
                <h3 className="text-xl font-semibold mb-2">Confirm Your Booking</h3>
                {slotData && (
                    <p className="text-md text-gray-600 dark:text-gray-300 mb-6">
                        You are booking a slot with <span className="font-bold">{resourceName}</span> on {' '}
                        <span className="font-bold">{slotData.startTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span> at {' '}
                        <span className="font-bold">{slotData.startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="mt-1 p-2 w-full bg-gray-100 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="mt-1 p-2 w-full bg-gray-100 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input type="tel" id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="mt-1 p-2 w-full bg-gray-100 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md bg-primary-500 text-white hover:bg-primary-600">Request Booking</button>
                    </div>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

export default PublicBookingForm;