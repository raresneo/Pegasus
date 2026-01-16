import React, { useState, useMemo } from 'react';
import { useMembers } from '../hooks/useMembers';
import { useProspects } from '../hooks/useProspects';
import { Member, Prospect, MembershipStatus, MenuItem } from '../types';
import * as Icons from '../components/icons';
import { menuItems } from '../lib/menu';
import Modal from '../components/Modal';

interface MembersPageProps {
    onViewMember: (member: Member) => void;
    onNavigate: (item: MenuItem) => void;
}

type MemberTab = 'everyone' | 'active' | 'expired' | 'frozen' | 'prospects';

const TABS: { id: MemberTab; label: string }[] = [
    { id: 'everyone', label: 'Everyone' },
    { id: 'active', label: 'Current Members' },
    { id: 'expired', label: 'Expired Members' },
    { id: 'frozen', label: 'Frozen Members' },
    { id: 'prospects', label: 'Prospects' },
];

const getStatusChip = (status: MembershipStatus | Prospect['status']) => {
    const memberStatusColors: Record<MembershipStatus, string> = {
        active: 'bg-green-500/10 text-green-500',
        frozen: 'bg-blue-500/10 text-blue-500',
        cancelled: 'bg-red-500/10 text-red-500',
        expired: 'bg-gray-500/10 text-gray-400',
    };

    const prospectStatusColors: Record<Prospect['status'], string> = {
        uncontacted: 'bg-gray-500/10 text-gray-400',
        contacted: 'bg-blue-500/10 text-blue-500',
        trial: 'bg-yellow-500/10 text-yellow-500',
        won: 'bg-green-500/10 text-green-500',
    };

    const colors = { ...memberStatusColors, ...prospectStatusColors };

    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${colors[status]}`}>{status.replace('_', ' ')}</span>
}

const MemberCard: React.FC<{ item: Member | Prospect; onViewMember: (member: Member) => void }> = ({ item, onViewMember }) => {
    const isMember = 'membership' in item;
    const name = isMember ? `${item.firstName} ${item.lastName}` : item.name;

    const { status, icon, color } = useMemo(() => {
        if (isMember) {
            const memberStatus = item.membership.status;
            if (memberStatus === 'active') return { status: 'Active', icon: <Icons.CheckCircleIcon className="w-5 h-5 text-green-400" />, color: 'text-green-400' };
            if (memberStatus === 'frozen') return { status: 'Frozen', icon: <Icons.ClockIcon className="w-5 h-5 text-blue-400" />, color: 'text-blue-400' };
            return { status: 'Expired', icon: <Icons.XCircleIcon className="w-5 h-5 text-text-dark-secondary" />, color: 'text-text-dark-secondary' };
        } else {
            const prospectStatus = item.status;
            if (prospectStatus === 'won') return { status: 'Won', icon: <Icons.CheckCircleIcon className="w-5 h-5 text-green-400" />, color: 'text-green-400' };
            return { status: 'Prospect', icon: <Icons.UserAddIcon className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' };
        }
    }, [item, isMember]);

    const detail1 = isMember ? `Joined: ${new Date(item.joinDate).toLocaleDateString()}` : `Assigned: ${item.assignedTo}`;
    const detail2 = isMember ? `ID: #${item.id}` : `Tags: ${item.tags.join(', ')}`;
    const avatar = item.avatar || (isMember ? `${item.firstName[0]}${item.lastName[0]}` : item.name.split(' ').map(n => n[0]).join(''));

    const isGrayedOut = isMember && ['expired', 'cancelled'].includes(item.membership.status);

    return (
        <div className={`bg-card-dark rounded-lg shadow-sm border border-border-dark p-3 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isGrayedOut ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary-800 rounded-md flex-shrink-0 flex items-center justify-center font-bold text-primary-200">
                    {avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-dark-primary truncate">{name}</p>
                    <p className="text-xs text-text-dark-secondary truncate">{isMember ? item.email : detail2}</p>
                </div>
            </div>
            <div className="text-xs text-text-dark-secondary mt-3 space-y-1">
                <p>{detail1}</p>
            </div>
            <div className="mt-auto pt-3 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    {icon}
                    <span className={`text-sm font-semibold ${color}`}>{status}</span>
                </div>
                {isMember && (
                    <button onClick={() => onViewMember(item as Member)} className="p-1.5 rounded-md text-primary-400 hover:bg-primary-500 hover:text-white">
                        <Icons.ChevronRightIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};


const MembersPage: React.FC<MembersPageProps> = ({ onViewMember, onNavigate }) => {
    // Use API hooks instead of DatabaseContext
    const { members, loading: membersLoading, updateMember, deleteMember } = useMembers(true);
    const { prospects, loading: prospectsLoading } = useProspects(true);

    const [activeTab, setActiveTab] = useState<MemberTab>('everyone');
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('grid');

    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editableMemberData, setEditableMemberData] = useState<Member | null>(null);

    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loading = membersLoading || prospectsLoading;

    const filteredAndSortedData = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();

        let data: (Member | Prospect)[] = [];

        if (activeTab === 'prospects') {
            data = prospects;
        } else {
            data = members.filter(member => {
                if (activeTab === 'everyone') return true;
                if (activeTab === 'active') return member.membership.status === 'active';
                if (activeTab === 'expired') return ['expired', 'cancelled'].includes(member.membership.status);
                if (activeTab === 'frozen') return member.membership.status === 'frozen';
                return false;
            });
        }

        const filtered = data.filter(item => {
            const name = 'membership' in item ? `${item.firstName} ${item.lastName}` : item.name;
            return name.toLowerCase().includes(lowerCaseSearch);
        });

        return filtered.sort((a, b) => {
            const nameA = 'membership' in a ? a.lastName : a.name;
            const nameB = 'membership' in b ? b.lastName : b.name;
            return nameA.localeCompare(nameB);
        });

    }, [members, prospects, activeTab, searchTerm]);

    const handleEditClick = (member: Member) => {
        setEditingMemberId(member.id);
        setEditableMemberData({ ...member });
    };

    const handleCancelClick = () => {
        setEditingMemberId(null);
        setEditableMemberData(null);
    };

    const handleSaveClick = async () => {
        if (editableMemberData) {
            try {
                await updateMember(editableMemberData.id, editableMemberData);
                handleCancelClick();
            } catch (error) {
                console.error('Failed to update member:', error);
            }
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editableMemberData) {
            setEditableMemberData({ ...editableMemberData, [name]: value });
        }
    };

    const handleDeleteClick = (member: Member) => {
        setMemberToDelete(member);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (memberToDelete) {
            try {
                await deleteMember(memberToDelete.id);
                setIsDeleteModalOpen(false);
                setMemberToDelete(null);
            } catch (error) {
                console.error('Failed to delete member:', error);
            }
        }
    };

    const handleAddNewMember = () => {
        const addMemberPage = menuItems
            .flatMap(item => item.children ? item.children : [item])
            .find(item => item.id === 'add-member');
        if (addMemberPage) {
            onNavigate(addMemberPage);
        }
    };

    const renderListView = () => {
        if (activeTab === 'prospects') {
            return <ProspectsTable prospects={filteredAndSortedData as Prospect[]} />;
        }
        return renderMembersTable();
    };

    const ProspectsTable: React.FC<{ prospects: Prospect[] }> = ({ prospects }) => (
        <table className="w-full text-sm text-left text-text-dark-secondary">
            <thead className="text-xs text-text-dark-primary uppercase bg-background-dark">
                <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Contact</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Assigned To</th>
                    <th scope="col" className="px-6 py-3">Last Contacted</th>
                </tr>
            </thead>
            <tbody>
                {prospects.map(prospect => (
                    <tr key={prospect.id} className="bg-card-dark border-b border-border-dark hover:bg-border-dark transition-colors duration-200">
                        <td className="px-6 py-4 font-medium text-text-dark-primary flex items-center">
                            <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center font-bold text-primary-200 mr-3">
                                {prospect.avatar}
                            </div>
                            <span>{prospect.name}</span>
                        </td>
                        <td className="px-6 py-4">
                            <div>{prospect.email}</div>
                            <div className="text-xs">{prospect.phone}</div>
                        </td>
                        <td className="px-6 py-4 capitalize">
                            {getStatusChip(prospect.status)}
                        </td>
                        <td className="px-6 py-4">
                            {prospect.assignedTo}
                        </td>
                        <td className="px-6 py-4">
                            {prospect.lastContacted}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderMembersTable = () => (
        <table className="w-full text-sm text-left text-text-dark-secondary">
            <thead className="text-xs text-text-dark-primary uppercase bg-background-dark">
                <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Join Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {(filteredAndSortedData as Member[]).map(member => (
                    <tr key={member.id} className="bg-card-dark border-b border-border-dark">
                        {editingMemberId === member.id && editableMemberData ? (
                            <>
                                <td className="px-6 py-4 font-medium text-text-dark-primary flex items-center">
                                    <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center font-bold text-primary-200 mr-3 flex-shrink-0">{member.avatar}</div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input type="text" name="firstName" value={editableMemberData.firstName} onChange={handleEditChange} className="p-1 bg-background-dark rounded-md border-border-dark focus:ring-primary-500 focus:border-primary-500 w-28" />
                                        <input type="text" name="lastName" value={editableMemberData.lastName} onChange={handleEditChange} className="p-1 bg-background-dark rounded-md border-border-dark focus:ring-primary-500 focus:border-primary-500 w-28" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <input type="email" name="email" value={editableMemberData.email} onChange={handleEditChange} className="p-1 bg-background-dark rounded-md border-border-dark focus:ring-primary-500 focus:border-primary-500" />
                                        <input type="tel" name="phone" value={editableMemberData.phone} onChange={handleEditChange} className="p-1 bg-background-dark rounded-md border-border-dark focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">{new Date(member.joinDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 capitalize">{getStatusChip(member.membership.status)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveClick} className="font-medium text-green-500 hover:underline">Save</button>
                                        <button onClick={handleCancelClick} className="font-medium text-text-dark-secondary hover:underline">Cancel</button>
                                    </div>
                                </td>
                            </>
                        ) : (
                            <>
                                <td className="px-6 py-4 font-medium text-text-dark-primary flex items-center">
                                    <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center font-bold text-primary-200 mr-3">{member.avatar}</div>
                                    <span>{member.firstName} {member.lastName}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div>{member.email}</div>
                                    <div className="text-xs">{member.phone}</div>
                                </td>
                                <td className="px-6 py-4">{new Date(member.joinDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 capitalize">{getStatusChip(member.membership.status)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-4">
                                        <button onClick={() => onViewMember(member)} className="font-medium text-primary-500 hover:underline">View</button>
                                        <button onClick={() => handleEditClick(member)} className="font-medium text-blue-500 hover:underline">Edit</button>
                                        <button onClick={() => handleDeleteClick(member)} className="font-medium text-red-500 hover:underline">Delete</button>
                                    </div>
                                </td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <>
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                description={`Are you sure you want to delete ${memberToDelete?.firstName} ${memberToDelete?.lastName}? This action cannot be undone.`}
                onConfirm={confirmDelete}
                confirmText="Delete"
                confirmColor="red"
            />
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dark-secondary" />
                            <input
                                type="text"
                                placeholder="Search Member..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 p-2 w-full sm:w-64 bg-background-dark rounded-md border border-border-dark"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select className="appearance-none bg-card-dark border border-border-dark rounded-md pl-3 pr-8 py-2 text-sm text-text-dark-primary focus:outline-none">
                                <option>Last Updated</option>
                                <option>Name A-Z</option>
                                <option>Join Date</option>
                            </select>
                            <Icons.ChevronDownIcon className="w-4 h-4 text-text-dark-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="flex items-center bg-background-dark rounded-md p-1">
                            <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-card-dark shadow-sm' : ''}`}>
                                <Icons.ViewGridIcon className="w-5 h-5 text-text-dark-secondary" />
                            </button>
                            <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-card-dark shadow-sm' : ''}`}>
                                <Icons.ViewListIcon className="w-5 h-5 text-text-dark-secondary" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-card-dark text-text-dark-secondary hover:bg-border-dark'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filteredAndSortedData.length === 0 && (
                    <div className="text-center py-16 text-text-dark-secondary">
                        <Icons.UsersIcon className="mx-auto h-16 w-16 text-border-dark" />
                        <h3 className="mt-4 text-xl font-semibold text-text-dark-primary">
                            No {activeTab === 'prospects' ? 'Prospects' : 'Members'} Found
                        </h3>
                        <p className="mt-2 text-sm">
                            There are no {activeTab === 'prospects' ? 'prospects' : 'members'} in this category yet.
                        </p>
                        {activeTab !== 'prospects' && (
                            <div className="mt-6">
                                <button
                                    onClick={handleAddNewMember}
                                    className="flex items-center mx-auto bg-primary-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-600 text-sm font-medium"
                                >
                                    <Icons.PlusIcon className="w-5 h-5 mr-2" />
                                    Add New Member
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'grid' && filteredAndSortedData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredAndSortedData.map(item => (
                            <MemberCard key={item.id} item={item} onViewMember={onViewMember} />
                        ))}
                    </div>
                )}

                {view === 'list' && filteredAndSortedData.length > 0 && (
                    <div className="overflow-x-auto mt-4 bg-card-dark rounded-lg">
                        {renderListView()}
                    </div>
                )}

            </div>
        </>
    );
};

export default MembersPage;