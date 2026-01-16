
import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Prospect } from '../types';
import FormModal from './FormModal';

interface AddProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddProspectModal: React.FC<AddProspectModalProps> = ({ isOpen, onClose }) => {
    const { addProspect, currentLocationId, locations } = useDatabase();
    // FIX: Added required locationId to the initial form data state.
    const [formData, setFormData] = useState<Omit<Prospect, 'id' | 'avatar' | 'lastContacted'>>({
        name: '',
        email: '',
        phone: '',
        status: 'uncontacted',
        assignedTo: 'Admin User',
        tags: [],
        locationId: currentLocationId === 'all' ? (locations[0]?.id || '') : currentLocationId
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (formData.name && formData.email) {
            addProspect(formData);
            onClose();
            // FIX: Reset form data including the required locationId property.
            setFormData({ 
                name: '', 
                email: '', 
                phone: '', 
                status: 'uncontacted', 
                assignedTo: 'Admin User', 
                tags: [], 
                locationId: currentLocationId === 'all' ? (locations[0]?.id || '') : currentLocationId 
            });
        } else {
            alert('Please fill in at least name and email.');
        }
    };

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Add New Prospect">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-dark-secondary mb-1">Status</label>
                     <select name="status" value={formData.status} onChange={handleChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark">
                        <option value="uncontacted">Uncontacted</option>
                        <option value="contacted">Contacted</option>
                        <option value="trial">Trial</option>
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Save Prospect</button>
            </div>
        </FormModal>
    );
};

export default AddProspectModal;
