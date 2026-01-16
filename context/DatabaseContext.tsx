import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import {
    Member, Booking, Payment, Task, User, Location, Product, OnlineHubSettings,
    StripeConfig, Asset, Prospect, Resource, AbsenceReason,
    Communication, Channel, Message, ActivityLog,
    BookingPageConfig, LinkGenerator, TrainerReview, MessageLocalizationSettings,
    NotificationTemplate, AccessLog, ProgressPhoto, MemberReview, Serviciu, CategorieBeneficiu, OfertaSpeciala,
    MembershipTier, TaxonomyItem, CustomFieldDefinition, MembershipStatus
} from '../types';
import {
    initialMembers, initialPayments, membershipTiers, initialTasks,
    mockUsers as initialMockUsers, mockLocations, initialProducts,
    initialProspects, mockResources, initialAbsenceReasons,
    mockBookingPageConfigs, initialLinkGenerators, initialChannels,
    initialMessages, initialActivityLogs, initialNotificationTemplates,
    mockBookings
} from '../lib/data';
import { add, isAfter, parseISO, areIntervalsOverlapping, format } from 'date-fns';

interface DatabaseContextType {
    members: Member[];
    bookings: Booking[];
    payments: Payment[];
    tasks: Task[];
    users: User[];
    locations: Location[];
    products: Product[];
    servicii: Serviciu[];
    beneficii: CategorieBeneficiu[];
    oferteSpeciale: OfertaSpeciala[];
    membershipTiers: MembershipTier[];
    assets: Asset[];
    prospects: Prospect[];
    resources: Resource[];
    absenceReasons: AbsenceReason[];
    notificationTemplates: NotificationTemplate[];
    channels: Channel[];
    messages: Message[];
    activityLogs: ActivityLog[];
    accessLogs: AccessLog[];
    bookingPageConfigs: BookingPageConfig[];
    linkGenerators: LinkGenerator[];
    trainerReviews: TrainerReview[];
    memberReviews: MemberReview[];

    assetCategories: TaxonomyItem[];
    productCategories: TaxonomyItem[];
    clientTags: TaxonomyItem[];
    taskTags: TaxonomyItem[];
    memberCustomFields: CustomFieldDefinition[];

    currentLocationId: string | 'all';
    onlineHubSettings: OnlineHubSettings;
    messageLocalization: MessageLocalizationSettings;
    setCurrentLocationId: (id: string | 'all') => void;

    addTaxonomyItem: (type: 'asset' | 'product' | 'client' | 'task', item: Omit<TaxonomyItem, 'id'>) => void;
    updateTaxonomyItem: (type: 'asset' | 'product' | 'client' | 'task', item: TaxonomyItem) => void;
    deleteTaxonomyItem: (type: 'asset' | 'product' | 'client' | 'task', id: string) => void;

    addCustomField: (field: Omit<CustomFieldDefinition, 'id'>) => void;
    updateCustomField: (field: CustomFieldDefinition) => void;
    deleteCustomField: (id: string) => void;

    addCheckIn: (memberId: string, method?: AccessLog['method'], locationId?: string) => void;
    purchaseMembership: (memberId: string, tierId: string, method: string) => void;
    updateMember: (member: Member) => void;
    addMember: (member: Omit<Member, 'id' | 'joinDate' | 'avatar' | 'membership' | 'locationId'>, tierId: string, joinDate: Date) => Member;
    deleteMember: (id: string) => void;
    bulkDeleteMembers: (ids: string[]) => void;
    bulkUpdateMemberStatus: (ids: string[], status: MembershipStatus) => void;
    bulkAddTagsToMembers: (ids: string[], tagId: string) => void;
    updateMemberStatus: (id: string, status: Member['membership']['status']) => void;
    updateMemberNotes: (id: string, notes: string) => void;
    addCasualMember: (data: { firstName: string; lastName: string; email: string; phone: string }) => Member;
    addPayment: (payment: Omit<Payment, 'id' | 'status'>) => void;
    addPrepayment: (memberId: string, amount: number, method: string) => void;
    addBillingAdjustment: (memberId: string, amount: number, reason: string) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTask: (task: Task, scope?: 'one' | 'future' | 'all') => void;
    deleteTask: (id: string) => void;
    archiveTask: (id: string) => void;
    unarchiveTask: (id: string) => void;
    addCommentToTask: (taskId: string, text: string) => void;
    toggleTaskChecklistItem: (taskId: string, itemId: string) => void;
    addNotificationTemplate: (template: Omit<NotificationTemplate, 'id'>) => void;
    updateNotificationTemplate: (template: NotificationTemplate) => void;
    deleteNotificationTemplate: (id: string) => void;
    addSubtask: (parentId: string, name: string) => void;
    updateProduct: (product: Product) => void;
    addProduct: (product: Omit<Product, 'id'>) => void;
    deleteProduct: (id: string) => void;
    addServiciu: (serviciu: Omit<Serviciu, 'id'>) => void;
    updateServiciu: (serviciu: Serviciu) => void;
    deleteServiciu: (id: string) => void;
    addOfertaSpeciala: (oferta: Omit<OfertaSpeciala, 'id'>) => void;
    updateOfertaSpeciala: (oferta: OfertaSpeciala) => void;
    deleteOfertaSpeciala: (id: string) => void;
    addUser: (user: Omit<User, 'id' | 'avatar'> & { password?: string }) => void;
    updateUser: (user: User) => void;
    deleteUser: (id: string) => void;
    updateStripeConfig: (config: StripeConfig) => void;
    updateProspect: (prospect: Prospect) => void;
    addProspect: (prospect: Omit<Prospect, 'id' | 'avatar' | 'lastContacted'>) => void;
    bulkDeleteProspects: (ids: string[]) => void;
    bulkAddTagsToProspects: (ids: string[], tag: string) => void;
    addBooking: (booking: Booking) => boolean;
    updateBooking: (booking: Booking, scope: 'one' | 'future' | 'all') => boolean;
    deleteBooking: (booking: Booking, scope: 'one' | 'future' | 'all') => void;
    addAbsenceReason: (reason: Omit<AbsenceReason, 'id'>) => void;
    updateAbsenceReason: (reason: AbsenceReason) => void;
    deleteAbsenceReason: (id: string) => void;
    addCommunication: (memberId: string, comm: Omit<Communication, 'id' | 'date' | 'author'>) => void;
    addChannel: (channel: Omit<Channel, 'id' | 'createdAt'>) => void;
    addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'authorId'> & { authorId?: string }) => void;
    linkTaskToChannel: (channelId: string, taskId: string) => void;
    importActivitiesToChannel: (channelId: string, activityIds: string[]) => void;
    addBookingPageConfig: (config: Omit<BookingPageConfig, 'id'>) => void;
    updateBookingPageConfig: (config: BookingPageConfig) => void;
    deleteBookingPageConfig: (id: string) => void;
    addLinkGenerator: (lg: Omit<LinkGenerator, 'id' | 'hits' | 'createdAt'>) => void;
    updateLinkGenerator: (lg: LinkGenerator) => void;
    deleteLinkGenerator: (id: string) => void;
    updateOnlineHubSettings: (settings: OnlineHubSettings) => void;
    toggleModuleVisibility: (moduleId: string) => void;
    updateMessageLocalization: (loc: MessageLocalizationSettings) => void;
    convertToProspect: (memberId: string) => void;
    addProgressPhoto: (memberId: string, photo: Omit<ProgressPhoto, 'id' | 'date'>) => void;
    addMemberReview: (review: Omit<MemberReview, 'id' | 'date'>) => void;
    addAsset: (asset: Omit<Asset, 'id'>) => void;
    updateAsset: (asset: Asset) => void;
    deleteAsset: (id: string) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const saved = localStorage.getItem(`pegasus_v4_${key}`);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
        console.warn(`Failed to load ${key} from localStorage:`, error);
        return defaultValue;
    }
};

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [members, setMembers] = useState<Member[]>(() => loadFromStorage('members', initialMembers));
    const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('bookings', mockBookings));
    const [payments, setPayments] = useState<Payment[]>(() => loadFromStorage('payments', initialPayments));
    const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasks', initialTasks));
    const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', initialProducts));
    const [servicii, setServicii] = useState<Serviciu[]>(() => loadFromStorage('servicii', []));
    const [oferteSpeciale, setOferteSpeciale] = useState<OfertaSpeciala[]>(() => loadFromStorage('oferteSpeciale', []));
    const [prospects, setProspects] = useState<Prospect[]>(() => loadFromStorage('prospects', initialProspects));
    const [absenceReasons, setAbsenceReasons] = useState<AbsenceReason[]>(() => loadFromStorage('absenceReasons', initialAbsenceReasons));
    const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(() => loadFromStorage('notificationTemplates', initialNotificationTemplates));
    const [channels, setChannels] = useState<Channel[]>(() => loadFromStorage('channels', initialChannels));
    const [messages, setMessages] = useState<Message[]>(() => loadFromStorage('messages', initialMessages));
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage('activityLogs', initialActivityLogs));
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => loadFromStorage('accessLogs', []));
    const [bookingPageConfigs, setBookingPageConfigs] = useState<BookingPageConfig[]>(() => loadFromStorage('bookingPageConfigs', mockBookingPageConfigs));
    const [linkGenerators, setLinkGenerators] = useState<LinkGenerator[]>(() => loadFromStorage('linkGenerators', initialLinkGenerators));
    const [memberReviews, setMemberReviews] = useState<MemberReview[]>(() => loadFromStorage('memberReviews', []));
    const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', initialMockUsers));
    const [assets, setAssets] = useState<Asset[]>(() => loadFromStorage('assets', [
        { id: 'a1', name: 'Banda Alergat T90', category: 'cat_cardio', lastMaintenance: '2024-01-10T10:00:00Z', nextMaintenance: '2024-07-10T10:00:00Z', status: 'operational', locationId: 'loc_central' },
        { id: 'a2', name: 'Crossover Pro Elite', category: 'cat_strength', lastMaintenance: '2023-12-05T10:00:00Z', nextMaintenance: '2024-06-05T10:00:00Z', status: 'operational', locationId: 'loc_central' },
        { id: 'a3', name: 'Sauna Infraroșu', category: 'cat_wellness', lastMaintenance: '2024-03-01T10:00:00Z', nextMaintenance: '2024-09-01T10:00:00Z', status: 'needs_service', locationId: 'loc_nord' }
    ]));
    const [currentLocationId, setCurrentLocationId] = useState<string | 'all'>('all');

    const [assetCategories, setAssetCategories] = useState<TaxonomyItem[]>(() => loadFromStorage('assetCategories', [
        { id: 'cat_cardio', name: 'Cardio', icon: 'FireIcon', color: 'text-orange-500' },
        { id: 'cat_strength', name: 'Strength', icon: 'FireIcon', color: 'text-red-500' },
        { id: 'cat_wellness', name: 'Wellness', icon: 'SparklesIcon', color: 'text-emerald-500' }
    ]));
    const [productCategories, setProductCategories] = useState<TaxonomyItem[]>(() => loadFromStorage('productCategories', [
        { id: 'cat_supps', name: 'Suplimente', icon: 'ArchiveIcon' },
        { id: 'cat_drinks', name: 'Băuturi', icon: 'ArchiveIcon' }
    ]));
    const [clientTags, setClientTags] = useState<TaxonomyItem[]>(() => loadFromStorage('clientTags', [
        { id: 'tag_vip', name: 'VIP', color: 'bg-yellow-500/20 text-yellow-500' },
        { id: 'tag_churn', name: 'Risc Churn', color: 'bg-red-500/20 text-red-500' }
    ]));
    const [taskTags, setTaskTags] = useState<TaxonomyItem[]>(() => loadFromStorage('taskTags', []));
    const [memberCustomFields, setMemberCustomFields] = useState<CustomFieldDefinition[]>(() => loadFromStorage('memberCustomFields', [
        { id: 'cf_clothing', name: 'Mărime Echipament', label: 'Mărime Tricou/Pantaloni', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'], required: false, description: 'Utilitate pentru kit-urile de bun venit.' },
        { id: 'cf_medical', name: 'Observații Medicale', label: 'Condiții Speciale', type: 'text', required: false, description: 'Atenționări pentru antrenori.' }
    ]));

    const [onlineHubSettings, setOnlineHubSettings] = useState<OnlineHubSettings>(() => loadFromStorage('onlineHubSettings', {
        letCustomersBookOnline: true,
        bookingAcceptance: 'auto',
        referralEnabled: true,
        referralRewardAmount: 50,
        referralRewardType: 'fixed',
        referralRewardCurrency: 'RON',
        visibleModuleIds: ['home', 'terminal', 'members-hub', 'schedule', 'pos', 'reports', 'tasks', 'assets', 'chat', 'settings'],
        stripe: { enabled: true, publishableKey: 'pk_test', secretKey: 'sk_test', mode: 'test' },
        googleBusinessConnected: false
    }));

    const [messageLocalization, setMessageLocalization] = useState<MessageLocalizationSettings>({
        language: 'ro',
        timeFormat: '24h',
        dateFormat: 'eeee, d MMMM'
    });

    const logActivity = useCallback((userId: string, action: string, entityType: ActivityLog['entityType'], entityId: string, entityName: string, details: string) => {
        const newLog: ActivityLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId, action, entityType, entityId, entityName, details,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, []);

    useEffect(() => {
        const data = {
            members, bookings, payments, tasks, products, servicii, oferteSpeciale, prospects,
            activityLogs, accessLogs, bookingPageConfigs, linkGenerators, memberReviews,
            users, assets, onlineHubSettings, assetCategories, productCategories, clientTags, taskTags, memberCustomFields
        };
        Object.entries(data).forEach(([key, val]) => {
            localStorage.setItem(`pegasus_v4_${key}`, JSON.stringify(val));
        });
    }, [members, bookings, payments, tasks, products, servicii, oferteSpeciale, prospects, activityLogs, accessLogs, bookingPageConfigs, linkGenerators, memberReviews, users, assets, onlineHubSettings, assetCategories, productCategories, clientTags, taskTags, memberCustomFields]);

    const checkBookingConflict = useCallback((booking: Booking): boolean => {
        return bookings.some(b => {
            if (b.id === booking.id || b.id.startsWith(`${booking.id}_`) || booking.id.startsWith(`${b.id}_`)) return false;
            if (b.resourceId !== booking.resourceId) return false;
            if (b.status === 'cancelled') return false;
            return areIntervalsOverlapping(
                { start: parseISO(b.startTime), end: parseISO(b.endTime) },
                { start: parseISO(booking.startTime), end: parseISO(booking.endTime) }
            );
        });
    }, [bookings]);

    const contextValue = useMemo<DatabaseContextType>(() => ({
        members, bookings, payments, tasks, users, locations: mockLocations, products, servicii, beneficii: [], oferteSpeciale, assets, prospects, resources: mockResources, absenceReasons, notificationTemplates, channels, messages, activityLogs, accessLogs, bookingPageConfigs, linkGenerators, trainerReviews: [], memberReviews, currentLocationId, onlineHubSettings, messageLocalization,
        membershipTiers,
        assetCategories, productCategories, clientTags, taskTags, memberCustomFields,
        setCurrentLocationId,

        addTaxonomyItem: (type, item) => {
            const newItem = { ...item, id: `tax_${Date.now()}` };
            const setter = type === 'asset' ? setAssetCategories : type === 'product' ? setProductCategories : type === 'client' ? setClientTags : setTaskTags;
            setter(prev => [...prev, newItem]);
            logActivity('u1', 'create', 'taxonomy', newItem.id, newItem.name, `Adăugare element în nomenclator: ${type}`);
        },
        updateTaxonomyItem: (type, item) => {
            const setter = type === 'asset' ? setAssetCategories : type === 'product' ? setProductCategories : type === 'client' ? setClientTags : setTaskTags;
            setter(prev => prev.map(i => i.id === item.id ? item : i));
        },
        deleteTaxonomyItem: (type, id) => {
            const setter = type === 'asset' ? setAssetCategories : type === 'product' ? setProductCategories : type === 'client' ? setClientTags : setTaskTags;
            setter(prev => prev.filter(i => i.id !== id));
        },

        addCustomField: (field) => {
            const newField = { ...field, id: `cf_${Date.now()}` };
            setMemberCustomFields(prev => [...prev, newField]);
            logActivity('u1', 'create', 'taxonomy', newField.id, newField.name, 'Adăugare câmp personalizat membru');
        },
        updateCustomField: (field) => setMemberCustomFields(prev => prev.map(f => f.id === field.id ? field : f)),
        deleteCustomField: (id) => setMemberCustomFields(prev => prev.filter(f => f.id !== id)),

        addCheckIn: (memberId, method: AccessLog['method'] = 'manual', locationId) => {
            const now = new Date().toISOString();
            const member = members.find(m => m.id === memberId);
            const finalLocationId = locationId || member?.locationId || 'loc_central';
            setAccessLogs(prev => [{ id: `acc_${Date.now()}`, memberId, timestamp: now, type: 'check_in', locationId: finalLocationId, method }, ...prev]);
            setMembers(prev => prev.map(m => m.id === memberId ? { ...m, visitHistory: [...(m.visitHistory || []), { date: now, locationId: finalLocationId }] } : m));
            logActivity('u1', 'check_in', 'access', memberId, member ? `${member.firstName} ${member.lastName}` : 'Membru', `Validare acces via ${method}`);
        },

        purchaseMembership: (memberId, tierId, method) => {
            setMembers(p => p.map(m => {
                if (m.id !== memberId) return m;
                const newEndDate = add(new Date(), { months: 1 }).toISOString();
                return { ...m, membership: { tierId, status: 'active', startDate: new Date().toISOString(), endDate: newEndDate } };
            }));
            logActivity('u1', 'purchase', 'member', memberId, memberId, `Achiziție plan ${tierId} via ${method}`);
        },

        updateMember: (m) => setMembers(p => p.map(x => x.id === m.id ? m : x)),
        addMember: (m, tierId, joinDate) => {
            const newMember = { ...m, id: `m_${Date.now()}`, joinDate: joinDate.toISOString(), avatar: m.firstName[0], locationId: 'loc_central', membership: { tierId, status: 'active', startDate: joinDate.toISOString(), endDate: add(joinDate, { months: 1 }).toISOString() } };
            setMembers(p => [...p, newMember as Member]);
            logActivity('u1', 'create', 'member', newMember.id, `${m.firstName} ${m.lastName}`, 'Membru adăugat manual');
            return newMember as Member;
        },
        deleteMember: (id) => setMembers(p => p.filter(x => x.id !== id)),
        bulkDeleteMembers: (ids) => {
            setMembers(p => p.filter(x => !ids.includes(x.id)));
            logActivity('u1', 'bulk_delete', 'member', 'multiple', `${ids.length} Membri`, 'Eliminare în masă');
        },
        bulkUpdateMemberStatus: (ids, status) => {
            setMembers(prev => prev.map(m => ids.includes(m.id) ? { ...m, membership: { ...m.membership, status } } : m));
            logActivity('u1', 'bulk_update', 'member', 'multiple', `${ids.length} Membri`, `Modificare status în masă: ${status}`);
        },
        bulkAddTagsToMembers: (ids, tagId) => {
            setMembers(prev => prev.map(m => ids.includes(m.id) ? { ...m, tags: Array.from(new Set([...(m.tags || []), tagId])) } : m));
            logActivity('u1', 'bulk_tag', 'member', 'multiple', `${ids.length} Membri`, `Adăugare tag ID: ${tagId}`);
        },
        updateMemberStatus: (id, status) => setMembers(p => p.map(m => m.id === id ? { ...m, membership: { ...m.membership, status } } : m)),
        updateMemberNotes: (id, notes) => setMembers(p => p.map(m => m.id === id ? { ...m, notes } : m)),
        addCasualMember: (data) => {
            const m = { ...data, id: `c_${Date.now()}`, avatar: 'C', joinDate: new Date().toISOString(), locationId: 'loc_central', membership: { status: 'expired', tierId: 'none', startDate: '', endDate: '' } };
            setMembers(p => [...p, m as Member]);
            return m as Member;
        },

        addPayment: (p) => setPayments(prev => [{ ...p, id: `pay_${Date.now()}`, status: 'succeeded' } as Payment, ...prev]),
        addPrepayment: (mId, amt, method) => {
            setPayments(prev => [{ id: `pay_${Date.now()}`, memberId: mId, amount: amt, date: new Date().toISOString(), description: 'Pre-plată cont', method, status: 'succeeded' } as Payment, ...prev]);
        },
        addBillingAdjustment: (mId, amt, reason) => {
            setPayments(prev => [{ id: `adj_${Date.now()}`, memberId: mId, amount: amt, date: new Date().toISOString(), description: `Ajustare: ${reason}`, method: 'Other', status: 'succeeded' } as Payment, ...prev]);
        },

        addTask: (task) => {
            const newTask = { ...task, id: `t_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isArchived: false };
            setTasks(prev => [...prev, newTask as Task]);
            logActivity('u1', 'create', 'task', newTask.id, task.name, 'Sarcina a fost creată');
        },
        updateTask: (task, scope) => {
            setTasks(prev => prev.map(t => t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t));
            logActivity('u1', 'update', 'task', task.id, task.name, 'Sarcina a fost actualizată');
        },
        deleteTask: (id) => setTasks(prev => prev.filter(t => t.id !== id)),
        archiveTask: (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t)),
        unarchiveTask: (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t)),
        addCommentToTask: (taskId, text) => {
            const comment = { id: `c_${Date.now()}`, authorId: 'u1', text, createdAt: new Date().toISOString() };
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t));
        },
        toggleTaskChecklistItem: (taskId, itemId) => {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, checklist: t.checklist?.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i) } : t));
        },
        addSubtask: (parentId, name) => {
            const subtask = { name, parentId, status: 'todo', priority: 'medium', endDate: new Date().toISOString(), assigneeId: null, isArchived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            // @ts-ignore
            setTasks(prev => [...prev, { ...subtask, id: `st_${Date.now()}` }]);
        },

        addNotificationTemplate: (template) => setNotificationTemplates(prev => [...prev, { ...template, id: `nt_${Date.now()}` }]),
        updateNotificationTemplate: (template) => setNotificationTemplates(prev => prev.map(t => t.id === template.id ? template : t)),
        deleteNotificationTemplate: (id) => setNotificationTemplates(prev => prev.filter(t => t.id !== id)),

        addProduct: (p) => setProducts(prev => [...prev, { ...p, id: `p_${Date.now()}` }]),
        updateProduct: (p) => setProducts(prev => prev.map(x => x.id === p.id ? p : x)),
        deleteProduct: (id) => setProducts(prev => prev.filter(p => p.id !== id)),

        addServiciu: (s) => setServicii(prev => [...prev, { ...s, id: `s_${Date.now()}` }]),
        updateServiciu: (s) => setServicii(prev => prev.map(x => x.id === s.id ? s : x)),
        deleteServiciu: (id) => setServicii(prev => prev.filter(s => s.id !== id)),

        addOfertaSpeciala: (o) => setOferteSpeciale(prev => [...prev, { ...o, id: `o_${Date.now()}` }]),
        updateOfertaSpeciala: (o) => setOferteSpeciale(prev => prev.map(x => x.id === o.id ? o : x)),
        deleteOfertaSpeciala: (id) => setOferteSpeciale(prev => prev.filter(o => o.id !== id)),

        addUser: (u) => setUsers(prev => [...prev, { ...u, id: `u_${Date.now()}`, avatar: u.name[0] }]),
        updateUser: (u) => setUsers(prev => prev.map(x => x.id === u.id ? u : x)),
        deleteUser: (id) => setUsers(prev => prev.filter(u => u.id !== id)),

        updateStripeConfig: (s) => setOnlineHubSettings(prev => ({ ...prev, stripe: s })),
        updateOnlineHubSettings: (s) => setOnlineHubSettings(s),
        toggleModuleVisibility: (id) => setOnlineHubSettings(prev => ({ ...prev, visibleModuleIds: prev.visibleModuleIds.includes(id) ? prev.visibleModuleIds.filter(x => x !== id) : [...prev.visibleModuleIds, id] })),
        updateMessageLocalization: (l) => setMessageLocalization(l),

        addProspect: (p) => setProspects(prev => [...prev, { ...p, id: `pr_${Date.now()}`, lastContacted: 'Azi', avatar: p.name[0] }]),
        updateProspect: (p) => setProspects(prev => prev.map(x => x.id === p.id ? p : x)),
        bulkDeleteProspects: (ids) => setProspects(prev => prev.filter(p => !ids.includes(p.id))),
        bulkAddTagsToProspects: (ids, tag) => setProspects(prev => prev.map(p => ids.includes(p.id) ? { ...p, tags: [...p.tags, tag] } : p)),
        convertToProspect: (id) => {
            const m = members.find(x => x.id === id);
            if (m) {
                setProspects(prev => [...prev, { id: `pr_${Date.now()}`, name: `${m.firstName} ${m.lastName}`, email: m.email, phone: m.phone, status: 'uncontacted', lastContacted: 'Acum', assignedTo: 'Admin', tags: ['Fost Membru'], avatar: m.avatar, locationId: m.locationId }]);
                setMembers(prev => prev.filter(x => x.id !== id));
            }
        },

        addBooking: (b) => {
            if (checkBookingConflict(b)) return false;
            setBookings(prev => [...prev, b]);
            logActivity('u1', 'create', 'booking', b.id, b.title, `Programare nouă creată.`);
            return true;
        },
        updateBooking: (b, scope) => {
            if (checkBookingConflict(b)) return false;
            setBookings(prev => prev.map(x => x.id === b.id ? b : x));
            return true;
        },
        deleteBooking: (b, scope) => {
            setBookings(prev => prev.filter(x => x.id !== b.id));
        },
        addAbsenceReason: (r) => setAbsenceReasons(prev => [...prev, { ...r, id: `ar_${Date.now()}` }]),
        updateAbsenceReason: (r) => setAbsenceReasons(prev => prev.map(x => x.id === r.id ? r : x)),
        deleteAbsenceReason: (id) => setAbsenceReasons(prev => prev.filter(x => x.id !== id)),

        addCommunication: (memberId, comm) => setMembers(prev => prev.map(m => m.id === memberId ? { ...m, communications: [...(m.communications || []), { ...comm, id: `comm_${Date.now()}`, date: new Date().toISOString(), author: 'Admin' }] } : m)),
        addChannel: (c) => setChannels(prev => [...prev, { ...c, id: `ch_${Date.now()}`, createdAt: new Date().toISOString() }]),
        addMessage: (m) => setMessages(prev => [...prev, { ...m, id: `msg_${Date.now()}`, createdAt: new Date().toISOString(), authorId: m.authorId || 'u1' }]),
        linkTaskToChannel: (chId, tId) => setChannels(prev => prev.map(ch => ch.id === chId ? { ...ch, linkedTaskIds: [...(ch.linkedTaskIds || []), tId] } : ch)),
        importActivitiesToChannel: (chId, ids) => {
            const logsToImport = activityLogs.filter(log => ids.includes(log.id));
            logsToImport.forEach(log => {
                setMessages(prev => [...prev, { id: `msg_import_${Date.now()}_${Math.random()}`, channelId: chId, authorId: 'system', content: `[ACTIVITY IMPORT]: ${log.details}`, createdAt: new Date().toISOString() }]);
            });
        },
        addBookingPageConfig: (c) => setBookingPageConfigs(prev => [...prev, { ...c, id: `bpc_${Date.now()}` }]),
        updateBookingPageConfig: (c) => setBookingPageConfigs(prev => prev.map(x => x.id === c.id ? c : x)),
        deleteBookingPageConfig: (id) => setBookingPageConfigs(prev => prev.filter(x => x.id !== id)),

        addLinkGenerator: (lg) => setLinkGenerators(prev => [...prev, { ...lg, id: `lg_${Date.now()}`, hits: 0, createdAt: new Date().toISOString() }]),
        updateLinkGenerator: (lg) => setLinkGenerators(prev => prev.map(x => x.id === lg.id ? lg : x)),
        deleteLinkGenerator: (id) => setLinkGenerators(prev => prev.filter(x => x.id !== id)),

        addProgressPhoto: (mId, photo) => setMembers(prev => prev.map(m => m.id === mId ? { ...m, progressPhotos: [...(m.progressPhotos || []), { ...photo, id: `photo_${Date.now()}`, date: new Date().toISOString() }] } : m)),
        addMemberReview: (rev) => setMemberReviews(prev => [...prev, { ...rev, id: `rev_${Date.now()}`, date: new Date().toISOString() }]),

        addAsset: (a) => {
            const newAsset = { ...a, id: `asset_${Date.now()}` };
            setAssets(prev => [...prev, newAsset as Asset]);
            logActivity('u1', 'create', 'asset', newAsset.id, a.name, 'A fost adăugat un nou echipament');
        },
        updateAsset: (a) => {
            setAssets(prev => prev.map(x => x.id === a.id ? a : x));
            logActivity('u1', 'update', 'asset', a.id, a.name, 'Activ actualizat');
        },
        deleteAsset: (id) => {
            setAssets(prev => prev.filter(x => x.id !== id));
            logActivity('u1', 'delete', 'asset', id, 'Activ Eliminat', 'Eliminare echipament din inventar');
        }
    }), [members, bookings, payments, tasks, users, products, servicii, oferteSpeciale, assets, prospects, absenceReasons, notificationTemplates, channels, messages, activityLogs, accessLogs, bookingPageConfigs, linkGenerators, memberReviews, currentLocationId, onlineHubSettings, messageLocalization, assetCategories, productCategories, clientTags, taskTags, memberCustomFields, logActivity, checkBookingConflict]);

    return (
        <DatabaseContext.Provider value={contextValue}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};