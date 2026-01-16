import React, { useState } from 'react';
import { Member, MenuItem } from '../types';
import {
    UserIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    HeartIcon,
    CakeIcon,
    BriefcaseIcon,
    PhotoIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ClientProfilePageProps {
    member: Member;
    onBack: () => void;
    onNavigate: (item: MenuItem, context?: any) => void;
}

const ClientProfilePage: React.FC<ClientProfilePageProps> = ({ member, onBack, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'progress' | 'membership'>('info');

    const membershipStatusColors: Record<string, string> = {
        active: 'bg-green-500/20 text-green-400 border-green-500/30',
        frozen: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        expired: 'bg-red-500/20 text-red-400 border-red-500/30',
        cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    const statusLabels: Record<string, string> = {
        active: 'Activ',
        frozen: 'Înghețat',
        expired: 'Expirat',
        cancelled: 'Anulat'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Profilul Meu</h1>
                    <p className="text-gray-400">Informații personale și progres</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    ← Înapoi
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={member.avatar}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary-500/30"
                        />
                        <div className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {member.firstName} {member.lastName}
                        </h2>
                        <p className="text-gray-400 mb-4">{member.email}</p>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${membershipStatusColors[member.membership.status]}`}>
                                {statusLabels[member.membership.status]}
                            </span>
                            {member.loyalty && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    {member.loyalty.tier}
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30">
                                Membru din {format(new Date(member.joinDate), 'yyyy', { locale: ro })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800">
                <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'info'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                    >
                        Informații Personale
                    </button>
                    <button
                        onClick={() => setActiveTab('membership')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'membership'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                    >
                        Abonament
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'progress'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }`}
                    >
                        Progres Foto
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <UserIcon className="w-5 h-5 mr-2 text-primary-400" />
                            Contact
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p className="text-white">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <PhoneIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Telefon</p>
                                    <p className="text-white">{member.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Adresă</p>
                                    <p className="text-white">
                                        {member.address.line1}
                                        {member.address.line2 && `, ${member.address.line2}`}
                                    </p>
                                    <p className="text-white">
                                        {member.address.city}, {member.address.postalCode}
                                    </p>
                                    <p className="text-white">{member.address.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <CakeIcon className="w-5 h-5 mr-2 text-primary-400" />
                            Detalii Personale
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <CalendarIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Data Nașterii</p>
                                    <p className="text-white">
                                        {format(new Date(member.dob), 'd MMMM yyyy', { locale: ro })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <UserIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Gen</p>
                                    <p className="text-white">{member.gender}</p>
                                </div>
                            </div>
                            {member.occupation && (
                                <div className="flex items-start">
                                    <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Ocupație</p>
                                        <p className="text-white">{member.occupation}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <HeartIcon className="w-5 h-5 mr-2 text-red-400" />
                            Contact Urgență
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <UserIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Nume</p>
                                    <p className="text-white">{member.emergencyContact.name}</p>
                                </div>
                            </div>
                            {member.emergencyContact.relationship && (
                                <div className="flex items-start">
                                    <HeartIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-400">Relație</p>
                                        <p className="text-white">{member.emergencyContact.relationship}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start">
                                <PhoneIcon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-400">Telefon</p>
                                    <p className="text-white">{member.emergencyContact.cell}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Program */}
                    {member.loyalty && (
                        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-xl border border-yellow-600/30 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <CheckCircleIcon className="w-5 h-5 mr-2 text-yellow-400" />
                                Program Loialitate
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400">Tier Actual</p>
                                    <p className="text-2xl font-bold text-yellow-400">{member.loyalty.tier}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Puncte</p>
                                    <p className="text-2xl font-bold text-white">{member.loyalty.points}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'membership' && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Detalii Abonament</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Status</p>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${membershipStatusColors[member.membership.status]}`}>
                                {statusLabels[member.membership.status]}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Data Început</p>
                            <p className="text-white font-semibold">
                                {format(new Date(member.membership.startDate), 'd MMMM yyyy', { locale: ro })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Data Expirare</p>
                            <p className="text-white font-semibold">
                                {format(new Date(member.membership.endDate), 'd MMMM yyyy', { locale: ro })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'progress' && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <PhotoIcon className="w-5 h-5 mr-2 text-primary-400" />
                        Fotografii Progres
                    </h3>
                    {member.progressPhotos && member.progressPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {member.progressPhotos.map(photo => (
                                <div key={photo.id} className="relative group">
                                    <img
                                        src={photo.url}
                                        alt="Progress"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-4">
                                        <span className="text-white text-sm font-semibold mb-2">
                                            {format(new Date(photo.date), 'd MMM yyyy', { locale: ro })}
                                        </span>
                                        {photo.weight && (
                                            <span className="text-white text-sm">
                                                {photo.weight} kg
                                            </span>
                                        )}
                                        {photo.notes && (
                                            <span className="text-gray-300 text-xs mt-2 text-center">
                                                {photo.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <PhotoIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">Nu ai fotografii de progres încă</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClientProfilePage;
