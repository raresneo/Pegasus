import { User, Member, Prospect, MembershipTier, Booking, Resource, Payment, Task, Channel, Message, ActivityLog, AbsenceReason, BookingPageConfig, Product, Location, LinkGenerator, NotificationTemplate } from '../types';
import { add, sub, formatISO } from 'date-fns';

export const mockLocations: Location[] = [
    { id: 'loc_central', name: 'Fitable Central', city: 'București', address: 'Strada Fitness 1', phone: '0711111111', managerId: 'u1', status: 'active' },
    { id: 'loc_nord', name: 'Fitable Nord', city: 'București', address: 'Șoseaua Nordului 45', phone: '0722222222', managerId: 'u2', status: 'active' },
    { id: 'loc_cluj', name: 'Fitable Cluj', city: 'Cluj-Napoca', address: 'Calea Turzii 12', phone: '0733333333', managerId: 'u1', status: 'active' },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Administrator', email: 'admin@fitable.com', password: 'password', role: 'admin', avatar: 'AD' },
  { id: 'u2', name: 'Antrenor Bob', email: 'trainer@fitable.com', password: 'password', role: 'trainer', avatar: 'AB', locationId: 'loc_central' },
  { id: 'u3', name: 'Membru Jane', email: 'member@fitable.com', password: 'password', role: 'member', avatar: 'MJ', locationId: 'loc_central' },
];

export const membershipTiers: MembershipTier[] = [
  { id: 'tier1', name: 'Acces de Bază', price: 149, billingCycle: 'monthly', features: ['Acces Sală (08:00 - 16:00)', 'Vestiar Personal'], popular: false },
  { id: 'tier2', name: 'Pro Access', price: 249, billingCycle: 'monthly', features: ['Acces Nelimitat 24/7', 'Acces Clase Grup', 'Prosop Inclus'], benefitIds: ['b1', 'b2'], popular: true },
  { id: 'tier3', name: 'VIP Pegasus', price: 2999, billingCycle: 'annually', features: ['Acces Toate Locațiile', '10 Sesiuni PT Incluse', 'Parcare VIP'], benefitIds: ['b1', 'b2', 'b3', 'b4'], popular: false },
];

export const initialAbsenceReasons: AbsenceReason[] = [
    { id: 'ar1', name: 'Motive Personale', description: 'Clientul a invocat motive personale.' },
    { id: 'ar2', name: 'Sănătate', description: 'Probleme medicale sau concediu medical.' },
    { id: 'ar3', name: 'Concediu', description: 'Plecat din localitate.' },
];

export const mockBookingPageConfigs: BookingPageConfig[] = [
    { id: 'bpc1', slug: 'pt-cu-bob', title: 'Sesiuni PT cu Antrenorul Bob', resourceIds: ['res3'], slotDuration: 60, isEnabled: true },
];

export const initialProducts: Product[] = [
    { id: 'prod1', locationId: 'loc_central', name: 'Shake Proteic Whey', category: 'Suplimente', price: 15.00, stock: 100, reorderPoint: 10 },
    { id: 'prod2', locationId: 'loc_nord', name: 'Apă Minerală 0.5L', category: 'Băuturi', price: 5.00, stock: 50, reorderPoint: 5 },
];

export const initialNotificationTemplates: NotificationTemplate[] = [
    { id: 'nt1', name: 'Reminder WhatsApp 24h', type: 'reminder', channel: 'whatsapp', content: 'Salut {{clientFirstName}}! Ne vedem mâine la {{startTime}} pentru {{service}} la {{location}}.', autoEnabled: true, sendTimeOffset: 1440 },
    { id: 'nt2', name: 'Confirmare Email Instant', type: 'instant', channel: 'email', content: 'Bună {{clientFirstName}}, programarea ta pentru {{service}} la data de {{date}} a fost confirmată.', autoEnabled: true },
    { id: 'nt3', name: 'Follow-up SMS', type: 'followup', channel: 'sms', content: 'Sperăm că ți-a plăcut antrenamentul de azi, {{clientFirstName}}! Nu uita să te programezi pentru următoarea sesiune.', autoEnabled: false }
];

const today = new Date();

export const initialMembers: Member[] = [
  {
    id: 'm_john_doe',
    locationId: 'loc_central',
    memberType: 'member',
    firstName: 'Ion',
    lastName: 'Popescu',
    email: 'ion.popescu@exemplu.ro',
    phone: '0744111222',
    joinDate: sub(today, { days: 150 }).toISOString(),
    membership: { tierId: 'tier2', status: 'active', startDate: sub(today, { days: 20 }).toISOString(), endDate: add(today, { days: 10 }).toISOString() },
    avatar: 'IP',
    dob: '1990-05-15',
    gender: 'Male',
    address: { line1: 'Strada Victoriei 1', city: 'București', country: 'România' },
    emergencyContact: { name: 'Maria Popescu', cell: '0744000111' },
    communications: [],
    visitHistory: [{ date: sub(today, { days: 2 }).toISOString(), locationId: 'loc_central' }]
  },
  {
    id: 'm_jane_smith',
    locationId: 'loc_nord',
    memberType: 'member',
    firstName: 'Elena',
    lastName: 'Marin',
    email: 'elena.marin@exemplu.ro',
    phone: '0755111333',
    joinDate: sub(today, { years: 1 }).toISOString(),
    membership: { tierId: 'tier3', status: 'active', startDate: sub(today, { days: 10 }).toISOString(), endDate: add(today, { days: 355 }).toISOString() },
    avatar: 'EM',
    dob: '1985-11-20',
    gender: 'Female',
    address: { line1: 'Calea Floreasca', city: 'București', country: 'România' },
    emergencyContact: { name: 'Andrei Marin', cell: '0755000222' },
  }
];

export const initialProspects: Prospect[] = [
  { id: 'p1', locationId: 'loc_cluj', name: 'Andrei Vasile', email: 'andrei@exemplu.ro', phone: '0722111222', status: 'contacted', lastContacted: 'acum 2 zile', assignedTo: 'Administrator', tags: ['Interesat PT'], avatar: 'AV' },
];

export const mockResources: Resource[] = [
    { id: 'res1', locationId: 'loc_central', name: 'Zona Forță', type: 'facility', capacity: 50 },
    { id: 'res2', locationId: 'loc_central', name: 'Studiou Aerobic', type: 'facility', capacity: 20 },
    { id: 'res3', locationId: 'loc_central', name: 'Bob Antrenor', type: 'trainer' },
    { id: 'res4', locationId: 'loc_nord', name: 'Alice Antrenor', type: 'trainer' },
];

export const mockBookings: Booking[] = [
    { 
        id: 'b1', 
        locationId: 'loc_central',
        title: 'Clasa Yoga', 
        resourceId: 'res2',
        startTime: formatISO(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)),
        endTime: formatISO(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)),
        color: 'green',
        status: 'scheduled'
    },
];

export const initialPayments: Payment[] = [
    { id: 'pay1', memberId: 'm_john_doe', locationId: 'loc_central', amount: 249, date: sub(today, { days: 20 }).toISOString(), description: 'Pro Access - Abonament Lună Curentă', status: 'succeeded' },
];

export const initialTasks: Task[] = [
    {
        id: 'task1', name: 'Follow up Andrei Vasile', assigneeId: 'u1', status: 'todo', priority: 'high',
        endDate: add(today, { days: 2 }).toISOString(), isArchived: false,
        createdAt: sub(today, { days: 1 }).toISOString(), updatedAt: sub(today, { days: 1 }).toISOString()
    },
];

export const initialChannels: Channel[] = [
    { id: 'c1', name: 'comunicare-generala', type: 'public', participantIds: ['u1', 'u2', 'u3'], createdAt: sub(today, { days: 10 }).toISOString() },
];

export const initialMessages: Message[] = [
    { id: 'msg1', channelId: 'c1', authorId: 'u1', content: 'Bine ați venit în centrul de comunicare Fitable!', createdAt: sub(today, { days: 9 }).toISOString() },
];

export const initialActivityLogs: ActivityLog[] = [];

export const initialLinkGenerators: LinkGenerator[] = [
    { id: 'lg1', name: 'QR Înscriere Recepție', type: 'page', slug: 'alatura-te', hits: 145, createdAt: sub(today, { days: 30 }).toISOString(), isEnabled: true },
    // FIX: Changed 'serviciu' to 'service' to match LinkGeneratorType definition.
    { id: 'lg2', name: 'Ofertă Vară PT', type: 'service', targetId: 'tier2', slug: 'oferta-vara', hits: 56, createdAt: sub(today, { days: 5 }).toISOString(), isEnabled: true },
];