import React, { useMemo } from 'react';
import { Member, MenuItem } from '../types';
import { useDatabase } from '../context/DatabaseContext';
import {
  CalendarIcon,
  TrophyIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  BoltIcon,
  StarIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';

interface ClientDashboardProps {
  member: Member;
  onNavigate: (item: MenuItem, context?: any) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ member, onNavigate }) => {
  const { bookings, accessLogs } = useDatabase();

  // Calculate upcoming bookings
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter(b => b.memberId === member.id && isAfter(new Date(b.startTime), now) && b.status === 'scheduled')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  }, [bookings, member.id]);

  // Calculate recent check-ins (last 7 days)
  const recentCheckIns = useMemo(() => {
    const sevenDaysAgo = addDays(new Date(), -7);
    return accessLogs
      .filter(log =>
        log.memberId === member.id &&
        log.type === 'check_in' &&
        isAfter(new Date(log.timestamp), sevenDaysAgo)
      ).length;
  }, [accessLogs, member.id]);

  // Calculate total visits this month
  const monthlyVisits = useMemo(() => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    return accessLogs
      .filter(log =>
        log.memberId === member.id &&
        log.type === 'check_in' &&
        isAfter(new Date(log.timestamp), firstDayOfMonth)
      ).length;
  }, [accessLogs, member.id]);

  // Calculate membership days remaining
  const daysRemaining = useMemo(() => {
    const endDate = new Date(member.membership.endDate);
    const today = new Date();
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [member.membership.endDate]);

  // Get membership status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'frozen': return 'text-blue-400';
      case 'expired': return 'text-red-400';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/30';
      case 'frozen': return 'bg-blue-500/20 border-blue-500/30';
      case 'expired': return 'bg-red-500/20 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 border-gray-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const statusLabels: Record<string, string> = {
    active: 'Activ',
    frozen: 'Înghețat',
    expired: 'Expirat',
    cancelled: 'Anulat'
  };

  const loyaltyTierColors: Record<string, string> = {
    Bronze: 'text-amber-600',
    Silver: 'text-gray-300',
    Gold: 'text-yellow-400',
    Platinum: 'text-cyan-400'
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bine ai venit, {member.firstName}!
            </h1>
            <p className="text-primary-100">
              Gata să continui progresul? 💪
            </p>
          </div>
          {member.avatar && (
            <div className="hidden md:block">
              <img
                src={member.avatar}
                alt={member.firstName}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Health Score Section */}
      {member.healthScore !== undefined && (
        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl border border-green-600/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <HeartIcon className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-sm text-green-300">Health Score</h3>
                <p className="text-3xl font-bold text-white">{member.healthScore}/100</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-400">
                {member.healthScore >= 80 ? '😊' : member.healthScore >= 60 ? '🙂' : '😐'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${member.healthScore}%` }}
            />
          </div>
          <p className="text-xs text-green-300 mt-2">
            {member.healthScore >= 80 && 'Excelent! Continui așa!'}
            {member.healthScore >= 60 && member.healthScore < 80 && 'Bine! Mai este loc de îmbunătățire.'}
            {member.healthScore < 60 && 'Hai să ne mobilizăm!'}
          </p>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Membership Status */}
        <div className={`rounded-xl border p-5 ${getStatusBg(member.membership.status)}`}>
          <div className="flex items-center justify-between mb-3">
            <SparklesIcon className="w-8 h-8 text-primary-400" />
            <span className={`text-sm font-semibold ${getStatusColor(member.membership.status)}`}>
              {statusLabels[member.membership.status]}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{daysRemaining} zile</h3>
          <p className="text-sm text-gray-400">Abonament rămas</p>
        </div>

        {/* Weekly Visits */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <FireIcon className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{recentCheckIns}</h3>
          <p className="text-sm text-gray-400">Check-in-uri (7 zile)</p>
        </div>

        {/* Monthly Visits */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{monthlyVisits}</h3>
          <p className="text-sm text-gray-400">Vizite luna aceasta</p>
        </div>

        {/* Loyalty Points */}
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 rounded-xl border border-yellow-600/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <span className={`text-sm font-semibold ${loyaltyTierColors[member.loyalty?.tier || 'Bronze']}`}>
              {member.loyalty?.tier || 'Bronze'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{member.loyalty?.points || 0}</h3>
          <p className="text-sm text-gray-400">Puncte loialitate</p>
        </div>
      </div>

      {/* Membership Progress */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BoltIcon className="w-5 h-5 mr-2 text-primary-400" />
          Progresul Abonamentului
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Zile folosite</span>
              <span className="text-sm font-semibold text-white">
                {Math.max(0, Math.ceil((new Date().getTime() - new Date(member.membership.startDate).getTime()) / (1000 * 60 * 60 * 24)))} zile
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                style={{
                  width: `${Math.min(100, (Math.max(0, Math.ceil((new Date().getTime() - new Date(member.membership.startDate).getTime()) / (1000 * 60 * 60 * 24))) / Math.max(1, Math.ceil((new Date(member.membership.endDate).getTime() - new Date(member.membership.startDate).getTime()) / (1000 * 60 * 60 * 24)))) * 100)}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Check-in-uri lunare</span>
              <span className="text-sm font-semibold text-white">{monthlyVisits} / 20</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                style={{ width: `${Math.min(100, (monthlyVisits / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <StarIcon className="w-5 h-5 mr-2 text-yellow-400" />
          Realizări
        </h3>
        <div className="space-y-3">
          {recentCheckIns >= 3 && (
            <div className="flex items-center space-x-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-2xl">🔥</div>
              <div>
                <p className="text-sm font-semibold text-white">Streak de 7 Zile!</p>
                <p className="text-xs text-gray-400">Continuă seria!</p>
              </div>
            </div>
          )}

          {monthlyVisits >= 10 && (
            <div className="flex items-center space-x-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="text-2xl">💪</div>
              <div>
                <p className="text-sm font-semibold text-white">10+ Vizite</p>
                <p className="text-xs text-gray-400">Dedicare exemplară!</p>
              </div>
            </div>
          )}

          {member.loyalty && member.loyalty.points >= 100 && (
            <div className="flex items-center space-x-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="text-2xl">⭐</div>
              <div>
                <p className="text-sm font-semibold text-white">Membru Loial</p>
                <p className="text-xs text-gray-400">100+ puncte!</p>
              </div>
            </div>
          )}

          {recentCheckIns < 3 && monthlyVisits < 10 && (!member.loyalty || member.loyalty.points < 100) && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Continuă să te antrenezi pentru a debloca realizări!</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <div className="lg:col-span-2 bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <CalendarIcon className="w-6 h-6 mr-2 text-primary-400" />
              Rezervările Tale
            </h2>
            <button
              onClick={() => onNavigate({ id: 'my-bookings', label: 'Rezervările Mele', icon: 'ClipboardDocumentListIcon', roles: ['member'] })}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Vezi tot →
            </button>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <div
                  key={booking.id}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-primary-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{booking.title}</h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {format(new Date(booking.startTime), 'EEEE, d MMMM yyyy, HH:mm', { locale: ro })}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-${booking.color}-500/20 text-${booking.color}-400 border border-${booking.color}-500/30`}>
                      {booking.status === 'scheduled' ? 'Programat' : booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 mb-4">Nu ai rezervări programate</p>
              <button
                onClick={() => onNavigate({ id: 'schedule', label: 'Program', icon: 'CalendarIcon', roles: ['member'] })}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Programează o Clasă
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 mr-2 text-primary-400" />
            Acțiuni Rapide
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => onNavigate({ id: 'schedule', label: 'Program', icon: 'CalendarIcon', roles: ['member'] })}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 transition-all flex items-center justify-between group"
            >
              <span className="font-semibold">Rezervă Clasă</span>
              <CalendarIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate({ id: 'my-profile', label: 'Profilul Meu', icon: 'UserCircleIcon', roles: ['member'] })}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition-all flex items-center justify-between group"
            >
              <span className="font-semibold">Vezi Profil</span>
              <UserGroupIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate({ id: 'payments', label: 'Plăți', icon: 'CreditCardIcon', roles: ['member'] })}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition-all flex items-center justify-between group"
            >
              <span className="font-semibold">Plăți & Facturi</span>
              <CreditCardIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate({ id: 'products', label: 'Produse', icon: 'ShoppingBagIcon', roles: ['member'] })}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition-all flex items-center justify-between group"
            >
              <span className="font-semibold">Cumpără Produse</span>
              <ShoppingBagIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section - Optional if we have progress photos */}
      {member.progressPhotos && member.progressPhotos.length > 0 && (
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Progresul Tău
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {member.progressPhotos.slice(0, 4).map(photo => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Progress"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">
                    {format(new Date(photo.date), 'd MMM yyyy', { locale: ro })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
