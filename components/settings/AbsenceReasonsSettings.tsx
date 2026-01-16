import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import * as Icons from '../icons';
import FormModal from '../FormModal';
import Modal from '../Modal';
import { AbsenceReason } from '../../types';

const AbsenceReasonsSettings: React.FC = () => {
    const { absenceReasons, addAbsenceReason, updateAbsenceReason, deleteAbsenceReason } = useDatabase();
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentReason, setCurrentReason] = useState<AbsenceReason | Omit<AbsenceReason, 'id'> | null>(null);
    const [reasonToDelete, setReasonToDelete] = useState<AbsenceReason | null>(null);

    const openAddModal = () => {
        setCurrentReason({ name: '', description: '' });
        setIsFormModalOpen(true);
    };

    const openEditModal = (reason: AbsenceReason) => {
        setCurrentReason(reason);
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (reason: AbsenceReason) => {
        setReasonToDelete(reason);
        setIsDeleteModalOpen(true);
    };

    const handleSave = () => {
        if (currentReason && currentReason.name) {
            if ('id' in currentReason) {
                updateAbsenceReason(currentReason);
            } else {
                addAbsenceReason(currentReason);
            }
            setIsFormModalOpen(false);
            setCurrentReason(null);
        }
    };

    const handleDelete = () => {
        if (reasonToDelete) {
            deleteAbsenceReason(reasonToDelete.id);
            setIsDeleteModalOpen(false);
            setReasonToDelete(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                description={`Are you sure you want to delete the reason "${reasonToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                confirmText="Delete"
                confirmColor="red"
            />
            {currentReason && (
                 <FormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={'id' in currentReason ? 'Edit Absence Reason' : 'Add Absence Reason'}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-dark-secondary mb-1">Reason Name</label>
                            <input type="text" value={currentReason.name} onChange={e => setCurrentReason(p => p ? {...p, name: e.target.value} : p)} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-dark-secondary mb-1">Description</label>
                            <textarea value={currentReason.description} onChange={e => setCurrentReason(p => p ? {...p, description: e.target.value} : p)} rows={3} className="p-2 w-full bg-background-dark rounded-md border border-border-dark"></textarea>
                        </div>
                    </div>
                     <div className="mt-6 flex justify-end gap-2">
                        <button onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Save Reason</button>
                    </div>
                </FormModal>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Absence Reasons</h1>
                    <p className="text-text-dark-secondary mt-1">Configure the reasons available when marking a member as absent.</p>
                </div>
                <button onClick={openAddModal} className="flex items-center bg-primary-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-600 text-sm font-medium">
                    <Icons.PlusIcon className="w-5 h-5 mr-2" />
                    Add New Reason
                </button>
            </div>

            <div className="bg-card-dark rounded-lg shadow-md overflow-hidden border border-border-dark">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-dark-secondary">
                        <thead className="text-xs text-text-dark-primary uppercase bg-background-dark">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark">
                            {absenceReasons.map(reason => (
                                <tr key={reason.id} className="hover:bg-background-dark/50">
                                    <td className="px-6 py-4 font-semibold text-text-dark-primary">{reason.name}</td>
                                    <td className="px-6 py-4">{reason.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <button onClick={() => openEditModal(reason)} className="p-2 rounded-md hover:bg-border-dark"><Icons.PencilIcon className="w-4 h-4" /></button>
                                            <button onClick={() => openDeleteModal(reason)} className="p-2 rounded-md hover:bg-border-dark"><Icons.TrashIcon className="w-4 h-4 text-red-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AbsenceReasonsSettings;