import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Member } from '../types';
import {
    ChartBarIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    ArrowTrendingUpIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface AdminProgressPageProps {
    onBack: () => void;
    onViewMember: (member: Member) => void;
}

const AdminProgressPage: React.FC<AdminProgressPageProps> = ({ onBack, onViewMember }) => {
    const { members } = useDatabase();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const membersWithProgress = useMemo(() => {
        return members.filter(m =>
            m.memberType === 'member' &&
            (m.bodyMeasurements?.length || m.progressPhotos?.length)
        );
    }, [members]);

    const filteredMembers = useMemo(() => {
        return membersWithProgress.filter(m =>
            `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [membersWithProgress, searchQuery]);

    // Get weight chart data for selected member
    const memberWeightData = useMemo(() => {
        if (!selectedMember || !selectedMember.bodyMeasurements) return [];

        return selectedMember.bodyMeasurements
            .filter(m => m.weight)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(m => ({
                date: format(new Date(m.date), 'dd MMM', { locale: ro }),
                weight: m.weight
            }));
    }, [selectedMember]);

    const latestMeasurement = selectedMember?.bodyMeasurements?.[selectedMember.bodyMeasurements.length - 1];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Progres Membri</h1>
                    <p className="text-gray-400">Vizualizare evoluție și rapoarte membri</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    ← Înapoi
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <ChartBarIcon className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{membersWithProgress.length}</h3>
                    <p className="text-sm text-gray-400">Membri cu Progres</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <ScaleIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {members.reduce((sum, m) => sum + (m.bodyMeasurements?.length || 0), 0)}
                    </h3>
                    <p className="text-sm text-gray-400">Total Măsurători</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUpIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                        {members.reduce((sum, m) => sum + (m.progressPhotos?.length || 0), 0)}
                    </h3>
                    <p className="text-sm text-gray-400">Total Fotografii</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Caută membri cu progres..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Members List */}
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Listă Membri</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => setSelectedMember(member)}
                                    className={`w-full text-left p-3 rounded-lg transition-all ${selectedMember?.id === member.id
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={member.avatar}
                                            alt={member.firstName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">{member.firstName} {member.lastName}</p>
                                            <p className="text-xs opacity-75">
                                                {member.bodyMeasurements?.length || 0} măsurători • {member.progressPhotos?.length || 0} poze
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-8">Nu s-au găsit membri</p>
                        )}
                    </div>
                </div>

                {/* Selected Member Progress */}
                <div className="lg:col-span-2">
                    {selectedMember ? (
                        <div className="space-y-6">
                            {/* Member Info */}
                            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img
                                        src={selectedMember.avatar}
                                        alt={selectedMember.firstName}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {selectedMember.firstName} {selectedMember.lastName}
                                        </h3>
                                        <p className="text-gray-400">{selectedMember.email}</p>
                                    </div>
                                    <button
                                        onClick={() => onViewMember(selectedMember)}
                                        className="ml-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
                                    >
                                        Vezi Profil Complet
                                    </button>
                                </div>

                                {latestMeasurement && (
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                                        {latestMeasurement.weight && (
                                            <div>
                                                <p className="text-sm text-gray-400">Greutate</p>
                                                <p className="text-xl font-bold text-white">{latestMeasurement.weight} kg</p>
                                            </div>
                                        )}
                                        {latestMeasurement.bodyFat && (
                                            <div>
                                                <p className="text-sm text-gray-400">Grăsime</p>
                                                <p className="text-xl font-bold text-white">{latestMeasurement.bodyFat}%</p>
                                            </div>
                                        )}
                                        {latestMeasurement.muscle && (
                                            <div>
                                                <p className="text-sm text-gray-400">Mușchi</p>
                                                <p className="text-xl font-bold text-white">{latestMeasurement.muscle} kg</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Weight Chart */}
                            {memberWeightData.length > 0 && (
                                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Evoluția Greutății</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={memberWeightData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                                                labelStyle={{ color: '#F3F4F6' }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#8B5CF6"
                                                strokeWidth={2}
                                                dot={{ fill: '#8B5CF6', r: 4 }}
                                                name="Greutate (kg)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Progress Photos */}
                            {selectedMember.progressPhotos && selectedMember.progressPhotos.length > 0 && (
                                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Fotografii Progres</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {selectedMember.progressPhotos.slice(0, 6).map(photo => (
                                            <div key={photo.id} className="relative group">
                                                <img
                                                    src={photo.url}
                                                    alt="Progress"
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs">
                                                        {format(new Date(photo.date), 'd MMM yyyy', { locale: ro })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center h-full flex items-center justify-center">
                            <div>
                                <UserCircleIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400">Selectează un membru pentru a vedea progresul</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminProgressPage;
