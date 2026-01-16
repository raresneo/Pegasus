import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';
import { BookingPageConfig, Resource } from '../../types';
import FormModal from '../FormModal';
import Modal from '../Modal';

const PublicBookingSettings: React.FC = () => {
    const { bookingPageConfigs, resources, addBookingPageConfig, updateBookingPageConfig, deleteBookingPageConfig } = useDatabase();
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<BookingPageConfig | null>(null);
    const [itemToDelete, setItemToDelete] = useState<BookingPageConfig | null>(null);

    const openAddModal = () => {
        setCurrentItem({ id: '', slug: '', title: '', resourceIds: [], slotDuration: 30, isEnabled: true, description: '' });
        setIsFormModalOpen(true);
    };

    const openEditModal = (item: BookingPageConfig) => {
        setCurrentItem(item);
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (item: BookingPageConfig) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleSave = () => {
        if (currentItem) {
            if (currentItem.id) {
                updateBookingPageConfig(currentItem);
            } else {
                addBookingPageConfig({
                    ...currentItem,
                    slug: currentItem.slug || currentItem.title.toLowerCase().replace(/\s+/g, '-')
                });
            }
            setIsFormModalOpen(false);
            setCurrentItem(null);
        }
    };
    
    const handleDelete = () => {
        if (itemToDelete) {
            deleteBookingPageConfig(itemToDelete.id);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentItem) return;
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        // @ts-ignore
        const checked = e.target.checked;
        setCurrentItem({ ...currentItem, [name]: isCheckbox ? checked : value });
    };

    const handleResourceToggle = (resourceId: string) => {
        if (!currentItem) return;
        const newResourceIds = currentItem.resourceIds.includes(resourceId)
            ? currentItem.resourceIds.filter(id => id !== resourceId)
            : [...currentItem.resourceIds, resourceId];
        setCurrentItem({ ...currentItem, resourceIds: newResourceIds });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                description={`Are you sure you want to delete the booking page "${itemToDelete?.title}"? This cannot be undone.`}
                onConfirm={handleDelete}
                confirmText="Delete"
                confirmColor="red"
            />
            {currentItem && (
                <FormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentItem.id ? 'Edit Booking Page' : 'Create Booking Page'}>
                    <div className="space-y-4">
                        <Toggle enabled={currentItem.isEnabled} onToggle={() => setCurrentItem({...currentItem, isEnabled: !currentItem.isEnabled})} label="Enable this booking page"/>
                        <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Page Title</label><input type="text" name="title" value={currentItem.title} onChange={handleFormChange} placeholder="e.g., Personal Training Sessions" className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/></div>
                        <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Page URL Slug</label><input type="text" name="slug" value={currentItem.slug} onChange={handleFormChange} placeholder="e.g., pt-sessions" className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/></div>
                        <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Description</label><textarea name="description" value={currentItem.description || ''} onChange={handleFormChange} rows={3} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/></div>
                        <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Appointment Duration (minutes)</label><input type="number" name="slotDuration" value={currentItem.slotDuration} onChange={handleFormChange} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/></div>
                        <div><label className="block text-sm font-medium text-text-dark-secondary mb-1">Included Resources</label>
                            <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-background-dark rounded-md border border-border-dark">
                                {resources.map(res => (
                                    <label key={res.id} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={currentItem.resourceIds.includes(res.id)} onChange={() => handleResourceToggle(res.id)} className="h-4 w-4 rounded text-primary-500 bg-card-dark border-border-dark"/>{res.name}</label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Save Page</button>
                    </div>
                </FormModal>
            )}

            <div className="flex justify-between items-center mb-8">
                <div><h1 className="text-3xl font-bold">Public Booking Pages</h1><p className="text-text-dark-secondary mt-1">Create and manage your "Calendly-style" booking links.</p></div>
                <button onClick={openAddModal} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-600 text-sm font-medium"><Icons.PlusIcon className="w-5 h-5 mr-2" />Create New Page</button>
            </div>

            <div className="bg-card-dark rounded-lg shadow-md border border-border-dark">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-dark-secondary">
                        <thead className="text-xs uppercase bg-background-dark"><tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Link</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr></thead>
                        <tbody>
                            {bookingPageConfigs.map(item => (
                                <tr key={item.id} className="border-b border-border-dark last:border-b-0">
                                    <td className="px-6 py-4 font-semibold text-text-dark-primary">{item.title}</td>
                                    <td className="px-6 py-4"><a href={`/public-booking/${item.slug}`} target="_blank" className="text-primary-400 hover:underline flex items-center gap-1">/public-booking/{item.slug} <Icons.LinkIcon className="w-3 h-3"/></a></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{item.isEnabled ? 'Enabled' : 'Disabled'}</span></td>
                                    <td className="px-6 py-4"><div className="flex space-x-2"><button onClick={() => openEditModal(item)} className="p-2 rounded-md hover:bg-border-dark"><Icons.PencilIcon className="w-4 h-4" /></button><button onClick={() => openDeleteModal(item)} className="p-2 rounded-md hover:bg-border-dark"><Icons.TrashIcon className="w-4 h-4 text-red-500" /></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{label}</span>
        <button type="button" onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-background-dark border border-border-dark'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


export default PublicBookingSettings;
