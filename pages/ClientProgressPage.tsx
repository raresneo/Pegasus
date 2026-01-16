import React, { useState, useMemo } from 'react';
import { Member, BodyMeasurement } from '../types';
import {
    ChartBarIcon,
    PlusIcon,
    ScaleIcon,
    CameraIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format, subMonths } from 'date-fns';
import { ro } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ClientProgressPageProps {
    member: Member;
    onBack: () => void;
}

const ClientProgressPage: React.FC<ClientProgressPageProps> = ({ member, onBack }) => {
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);

    // Get measurements sorted by date
    const sortedMeasurements = useMemo(() => {
        return (member.bodyMeasurements || [])
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [member.bodyMeasurements]);

    // Latest measurement
    const latestMeasurement = sortedMeasurements[sortedMeasurements.length - 1];
    const previousMeasurement = sortedMeasurements[sortedMeasurements.length - 2];

    // Calculate trends
    const weightTrend = useMemo(() => {
        if (!latestMeasurement?.weight || !previousMeasurement?.weight) return null;
        return latestMeasurement.weight - previousMeasurement.weight;
    }, [latestMeasurement, previousMeasurement]);

    // Prepare chart data
    const weightChartData = useMemo(() => {
        return sortedMeasurements
            .filter(m => m.weight)
            .map(m => ({
                date: format(new Date(m.date), 'dd MMM', { locale: ro }),
                weight: m.weight
            }));
    }, [sortedMeasurements]);

    const bodyCompositionData = useMemo(() => {
        return sortedMeasurements
            .filter(m => m.bodyFat || m.muscle)
            .map(m => ({
                date: format(new Date(m.date), 'dd MMM', { locale: ro }),
                bodyFat: m.bodyFat,
                muscle: m.muscle
            }));
    }, [sortedMeasurements]);

    const measurementsChartData = useMemo(() => {
        return sortedMeasurements
            .filter(m => Object.values(m.measurements).some(v => v))
            .map(m => ({
                date: format(new Date(m.date), 'dd MMM', { locale: ro }),
                chest: m.measurements.chest,
                waist: m.measurements.waist,
                hips: m.measurements.hips,
                bicep: m.measurements.bicep,
                thigh: m.measurements.thigh,
                calf: m.measurements.calf
            }));
    }, [sortedMeasurements]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Progresul Meu</h1>
                    <p className="text-gray-400">Măsurători, fotografii și evoluție</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    ← Înapoi
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setShowMeasurementForm(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl p-6 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 rounded-full p-3">
                            <PlusIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Adaugă Măsurători</h3>
                            <p className="text-sm text-primary-100">Înregistrează progresul de astăzi</p>
                        </div>
                    </div>
                    <ArrowPathIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>

                <button
                    onClick={() => setShowPhotoUpload(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-6 transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 rounded-full p-3">
                            <CameraIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-lg">Adaugă Fotografie</h3>
                            <p className="text-sm text-purple-100">Documentează transformarea</p>
                        </div>
                    </div>
                    <ArrowPathIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            {/* Current Stats */}
            {latestMeasurement && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <ScaleIcon className="w-6 h-6 mr-2 text-primary-400" />
                        Statusul Actual
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {latestMeasurement.weight && (
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Greutate</p>
                                <div className="flex items-end space-x-2">
                                    <p className="text-2xl font-bold text-white">{latestMeasurement.weight}</p>
                                    <p className="text-sm text-gray-400 mb-1">kg</p>
                                    {weightTrend !== null && (
                                        <div className="flex items-center ml-2">
                                            {weightTrend > 0 ? (
                                                <TrendingUpIcon className="w-4 h-4 text-red-400" />
                                            ) : weightTrend < 0 ? (
                                                <TrendingDownIcon className="w-4 h-4 text-green-400" />
                                            ) : null}
                                            <span className={`text-xs ml-1 ${weightTrend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)}kg
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {latestMeasurement.bodyFat && (
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Grăsime Corporală</p>
                                <div className="flex items-end space-x-2">
                                    <p className="text-2xl font-bold text-white">{latestMeasurement.bodyFat}</p>
                                    <p className="text-sm text-gray-400 mb-1">%</p>
                                </div>
                            </div>
                        )}

                        {latestMeasurement.muscle && (
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Masă Musculară</p>
                                <div className="flex items-end space-x-2">
                                    <p className="text-2xl font-bold text-white">{latestMeasurement.muscle}</p>
                                    <p className="text-sm text-gray-400 mb-1">kg</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-800/50 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">Ultima Măsurare</p>
                            <p className="text-sm font-semibold text-white">
                                {format(new Date(latestMeasurement.date), 'd MMM yyyy', { locale: ro })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Weight Chart */}
            {weightChartData.length > 0 && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Evoluția Greutății</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weightChartData}>
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
                                strokeWidth={3}
                                dot={{ fill: '#8B5CF6', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="Greutate (kg)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Body Composition Chart */}
            {bodyCompositionData.length > 0 && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Compoziție Corporală</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={bodyCompositionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            {bodyCompositionData.some(d => d.bodyFat) && (
                                <Area
                                    type="monotone"
                                    dataKey="bodyFat"
                                    stackId="1"
                                    stroke="#EF4444"
                                    fill="#EF4444"
                                    fillOpacity={0.6}
                                    name="Grăsime (%)"
                                />
                            )}
                            {bodyCompositionData.some(d => d.muscle) && (
                                <Area
                                    type="monotone"
                                    dataKey="muscle"
                                    stackId="2"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.6}
                                    name="Mușchi (kg)"
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Measurements Chart */}
            {measurementsChartData.length > 0 && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Evoluția Circumferințelor</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={measurementsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            {measurementsChartData.some(d => d.chest) && (
                                <Line type="monotone" dataKey="chest" stroke="#3B82F6" name="Piept (cm)" strokeWidth={2} />
                            )}
                            {measurementsChartData.some(d => d.waist) && (
                                <Line type="monotone" dataKey="waist" stroke="#EF4444" name="Talie (cm)" strokeWidth={2} />
                            )}
                            {measurementsChartData.some(d => d.hips) && (
                                <Line type="monotone" dataKey="hips" stroke="#8B5CF6" name="Șolduri (cm)" strokeWidth={2} />
                            )}
                            {measurementsChartData.some(d => d.bicep) && (
                                <Line type="monotone" dataKey="bicep" stroke="#10B981" name="Braț (cm)" strokeWidth={2} />
                            )}
                            {measurementsChartData.some(d => d.thigh) && (
                                <Line type="monotone" dataKey="thigh" stroke="#F59E0B" name="Coapsă (cm)" strokeWidth={2} />
                            )}
                            {measurementsChartData.some(d => d.calf) && (
                                <Line type="monotone" dataKey="calf" stroke="#EC4899" name="Gambă (cm)" strokeWidth={2} />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Photo Gallery */}
            {member.progressPhotos && member.progressPhotos.length > 0 && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                        <CameraIcon className="w-6 h-6 mr-2 text-primary-400" />
                        Galerie Fotografii
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {member.progressPhotos.slice(0, 8).map(photo => (
                            <div key={photo.id} className="relative group">
                                <img
                                    src={photo.url}
                                    alt="Progress"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                                    <span className="text-white text-sm font-semibold mb-1">
                                        {format(new Date(photo.date), 'd MMM yyyy', { locale: ro })}
                                    </span>
                                    {photo.weight && (
                                        <span className="text-white text-xs">{photo.weight} kg</span>
                                    )}
                                    {photo.type && (
                                        <span className="text-primary-400 text-xs mt-1 capitalize">{photo.type}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Data State */}
            {(!member.bodyMeasurements || member.bodyMeasurements.length === 0) && (!member.progressPhotos || member.progressPhotos.length === 0) && (
                <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
                    <ChartBarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Începe să îți trackuiești progresul!</h3>
                    <p className="text-gray-400 mb-6">
                        Adaugă prima măsurare sau fotografie pentru a vedea evoluția ta în timp.
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={() => setShowMeasurementForm(true)}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        >
                            Adaugă Măsurători
                        </button>
                        <button
                            onClick={() => setShowPhotoUpload(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Adaugă Fotografie
                        </button>
                    </div>
                </div>
            )}

            {/* Modals would go here */}
            {showMeasurementForm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Adaugă Măsurători</h3>
                        <p className="text-gray-400">Form-ul va fi implementat în următoarea versiune...</p>
                        <button
                            onClick={() => setShowMeasurementForm(false)}
                            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Închide
                        </button>
                    </div>
                </div>
            )}

            {showPhotoUpload && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Adaugă Fotografie de Progres</h3>
                        <p className="text-gray-400">Upload-ul va fi implementat în următoarea versiune...</p>
                        <button
                            onClick={() => setShowPhotoUpload(false)}
                            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Închide
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientProgressPage;
