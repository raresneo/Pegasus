import React, { useState } from 'react';
import { Member, MembershipStatus } from '../../types';
import { membershipTiers } from '../../lib/data';
import * as Icons from '../icons';
import { useDatabase } from '../../context/DatabaseContext';
import FormModal from '../FormModal';
import PurchaseModal from './PurchaseModal';

interface MembershipTabProps {
    member: Member;
}

const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <thead className="text-xs text-text-dark-secondary uppercase bg-background-dark">
        <tr>{children}</tr>
    </thead>
);

const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <tr className="bg-card-dark border-b border-border-dark last:border-b-0">{children}</tr>
);

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => <th scope="col" className="px-6 py-3">{children}</th>;
const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <td className={`px-6 py-4 ${className}`}>{children}</td>;


const MembershipTab: React.FC<MembershipTabProps> = ({ member }) => {
    const { updateMemberStatus } = useDatabase();
    const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
    const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleHoldSubmit = () => {
        updateMemberStatus(member.id, 'frozen');
        setIsHoldModalOpen(false);
        showSuccessMessage('Membership has been put on hold.');
    };

    const handleGiftSubmit = () => {
        // In a real app, this would extend the end date
        setIsGiftModalOpen(false);
        showSuccessMessage('Gifted time has been added to the membership.');
    };
    
    const currentTier = membershipTiers.find(t => t.id === member.membership.tierId);

    // Mock data for other sections to match the UI
    const mockHistoricMemberships = [
        { type: 'Ems group 8', startDate: '29 Oct 2025', endDate: '28 Nov 2025', status: 'Expired', visits: '0/8' },
        { type: 'Ems group 12 recur', startDate: '19 Aug 2025', endDate: '19 Sep 2025', status: 'Canceled (Leaving Country)', visits: '7/12' },
    ];
    
    return (
        <div className="space-y-8">
            {successMessage && (
                <div className="bg-green-500/10 text-green-500 p-3 rounded-md mb-4 text-sm animate-fadeIn">
                    {successMessage}
                </div>
            )}
            <PurchaseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} member={member} />

            <FormModal isOpen={isHoldModalOpen} onClose={() => setIsHoldModalOpen(false)} title="Place Membership on Hold">
                <p className="text-sm text-text-dark-secondary">
                    Placing this membership on hold will freeze billing and access until it is reactivated. Are you sure?
                </p>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-text-dark-secondary mb-1">Reason for Hold (Optional)</label>
                    <textarea rows={3} className="p-2 w-full bg-background-dark rounded-md border border-border-dark text-sm"></textarea>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setIsHoldModalOpen(false)} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                    <button onClick={handleHoldSubmit} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Confirm Hold</button>
                </div>
            </FormModal>

            <FormModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} title="Gift Time">
                <p className="text-sm text-text-dark-secondary">
                    Extend the member's current plan by a specified amount of time.
                </p>
                <div className="mt-4">
                    <label className="block text-xs font-medium text-text-dark-secondary mb-1">Days to Add</label>
                    <input type="number" placeholder="e.g., 14" className="p-2 w-full bg-background-dark rounded-md border border-border-dark text-sm"/>
                </div>
                 <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setIsGiftModalOpen(false)} className="px-4 py-2 text-sm rounded-md bg-background-dark hover:bg-border-dark">Cancel</button>
                    <button onClick={handleGiftSubmit} className="px-4 py-2 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600">Gift Time</button>
                </div>
            </FormModal>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Current Memberships</h3>
                     <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-primary-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-600">
                        <Icons.PlusIcon className="w-4 h-4 mr-2" />
                        Add Membership
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-dark-secondary">
                        <TableHeader>
                            <Th>Membership Type</Th><Th>Start Date</Th><Th>End Date</Th><Th>Status</Th><Th>Visits Used</Th><Th>Actions</Th>
                        </TableHeader>
                        <tbody>
                            <TableRow>
                                <Td>{currentTier?.name || 'Unknown'}</Td>
                                <Td>{new Date(member.membership.startDate).toLocaleDateString()}</Td>
                                <Td>{new Date(member.membership.endDate).toLocaleDateString()}</Td>
                                <Td className="capitalize">{member.membership.status}</Td>
                                <Td>2/8</Td>
                                <Td>
                                    <div className="flex space-x-2">
                                        <button onClick={() => setIsHoldModalOpen(true)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Hold</button>
                                        <button onClick={() => setIsGiftModalOpen(true)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Gift Time</button>
                                    </div>
                                </Td>
                            </TableRow>
                        </tbody>
                    </table>
                </div>
            </section>
            
            <section>
                <h3 className="text-lg font-semibold mb-4">Addon Memberships</h3>
                <div className="text-center text-sm text-text-dark-secondary p-4 bg-background-dark rounded-md">
                    No Addon Memberships
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-4">Historic Memberships</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-dark-secondary">
                        <TableHeader>
                            <Th>Membership Type</Th><Th>Start Date</Th><Th>End Date</Th><Th>Status</Th><Th>Visits Used</Th>
                        </TableHeader>
                        <tbody>
                             {mockHistoricMemberships.map((item, index) => (
                                <TableRow key={index}>
                                    <Td>{item.type}</Td>
                                    <Td>{item.startDate}</Td>
                                    <Td>{item.endDate}</Td>
                                    <Td>{item.status}</Td>
                                    <Td>{item.visits}</Td>
                                </TableRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default MembershipTab;