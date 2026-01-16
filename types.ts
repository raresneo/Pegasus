
import { FunctionDeclaration } from '@google/genai';

export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  locationId?: string;
  rating?: number;
  reviewCount?: number;
  password?: string;
}

export type CustomFieldType = 'text' | 'number' | 'boolean' | 'date' | 'select';

export interface CustomFieldDefinition {
    id: string;
    name: string;
    label: string;
    type: CustomFieldType;
    options?: string[];
    required: boolean;
    description?: string;
}

export interface Member {
  id: string;
  locationId: string;
  memberType: MemberType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  membership: Membership;
  avatar: string;
  loyalty?: LoyaltyStatus;
  healthScore?: number;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship?: string;
    cell: string;
    email?: string;
  };
  notes?: string;
  visitHistory?: { date: string; locationId: string }[];
  communications?: Communication[];
  progressPhotos?: ProgressPhoto[];
  customFields?: Record<string, any>;
  dob: string;
  gender: string;
  occupation?: string;
  organization?: string;
  salesRep?: string;
  sourcePromotion?: string;
  referredBy?: string;
  trainer?: string;
  tags?: string[];
  involvementType?: string;
  title?: string;
  debtCollection?: {
      maxAmountToBill: number;
      deadline: string;
      isBadDebtor: boolean;
      isBlacklisted: boolean;
  };
}

export interface TaxonomyItem {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

export interface CategorieBeneficiu {
    id: string;
    nume: string;
    icon: string;
}

export interface Serviciu {
    id: string;
    nume: string;
    descriere: string;
    pret: number;
    categorie: string;
    durataMinute: number;
    locatieId: string;
}

export interface OfertaSpeciala {
    id: string;
    nume: string;
    descriere: string;
    pret: number;
    tipTinta: 'abonament' | 'serviciu' | 'pachet';
    tintaId: string; 
    slug: string; 
    valabilaPanaLa: string;
    textBadge?: string;
}

export interface ProgressPhoto {
    id: string;
    date: string;
    url: string;
    weight?: number;
    notes?: string;
}

export interface MemberReview {
    id: string;
    memberId: string;
    targetId: string;
    stars: number;
    comment: string;
    date: string;
}

export interface StripeConfig {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    mode: 'test' | 'live';
    webhookSecret?: string;
}

export interface AccessLog {
    id: string;
    memberId: string;
    timestamp: string;
    type: 'check_in' | 'check_out';
    locationId: string;
    method: 'qr' | 'manual' | 'nfc_simulated';
}

export interface LoyaltyStatus {
    points: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    history: { date: string; points: number; reason: string }[];
}

export interface Asset {
    id: string;
    name: string;
    category: string;
    lastMaintenance: string;
    nextMaintenance: string;
    status: 'operational' | 'repair' | 'needs_service';
    locationId: string;
}

export interface NotificationTemplate {
    id: string;
    name: string;
    type: 'instant' | 'reminder' | 'followup' | 'custom';
    channel: 'whatsapp' | 'sms' | 'email';
    content: string;
    autoEnabled: boolean;
    sendTimeOffset?: number; 
}

export interface MessageLocalizationSettings {
    language: 'ro' | 'en';
    timeFormat: '12h' | '24h';
    dateFormat: string; 
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  managerId: string;
  status: 'active' | 'maintenance' | 'closed';
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  roles: UserRole[];
  children?: MenuItem[];
  description?: string; 
}

export interface CopilotAction {
  functionDeclaration: FunctionDeclaration;
  handler: (args: any) => Promise<{ message: string; data?: any[] }>;
}

export type MembershipStatus = 'active' | 'frozen' | 'cancelled' | 'expired';
export type MemberType = 'prospect' | 'member';

export interface Membership {
  tierId: string;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
}

export interface Communication {
    id: string;
    type: CommunicationType;
    subject: string;
    notes: string;
    date: string;
    author: string;
}

export type CommunicationType = 'email' | 'sms' | 'call' | 'note' | 'absence' | 'whatsapp' | 'review_request';

export interface Payment {
    id: string;
    memberId: string;
    locationId: string;
    amount: number;
    date: string;
    description: string;
    method?: 'Card' | 'Cash' | 'Stripe' | 'Other';
    stripeRef?: string;
    status: 'succeeded' | 'pending' | 'failed';
}

export interface Booking {
    id: string;
    seriesId?: string;
    locationId: string;
    title: string;
    resourceId: string;
    memberId?: string;
    startTime: string;
    endTime: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
    status: 'scheduled' | 'attended' | 'no-show' | 'cancelled';
    recurrence?: {
        rule: RecurrenceRule;
        endDate: string;
        exceptionDates?: string[];
    };
    isException?: boolean;
}

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';

export interface Product {
    id: string;
    locationId: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    reorderPoint: number;
}

export interface Task {
    id: string;
    name: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    endDate: string;
    assigneeId: string | null;
    isArchived: boolean;
    checklist?: TaskChecklistItem[];
    comments?: TaskComment[];
    activity?: TaskActivity[];
    parentId?: string;
    dependencies?: string[];
    recurrence?: {
        rule: RecurrenceRule;
        endDate: string;
        exceptionDates?: string[];
    };
    seriesId?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface TaskComment {
    id: string;
    authorId: string;
    text: string;
    createdAt: string;
}

export interface TaskActivity {
    id: string;
    action: string;
    authorId?: string;
    timestamp: string;
}

export interface OnlineHubSettings {
    letCustomersBookOnline: boolean;
    bookingAcceptance: 'auto' | 'manual';
    referralEnabled: boolean;
    referralRewardAmount: number;
    referralRewardType: 'fixed' | 'percentage' | 'days';
    referralRewardCurrency: string;
    visibleModuleIds: string[];
    stripe: StripeConfig;
    googleBusinessConnected?: boolean;
}

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    entityType: 'task' | 'member' | 'booking' | 'prospect' | 'access' | 'taxonomy' | 'asset';
    entityId: string;
    entityName: string;
    details: string;
    timestamp: string;
}

export interface Prospect {
    id: string;
    locationId: string;
    name: string;
    email: string;
    phone: string;
    status: 'uncontacted' | 'contacted' | 'trial' | 'won';
    lastContacted: string;
    assignedTo: string;
    tags: string[];
    avatar: string;
}

export interface MembershipTier {
    id: string;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'annually';
    features: string[];
    benefitIds?: string[];
    popular: boolean;
}

export type ResourceType = 'facility' | 'trainer';

export interface Resource {
    id: string;
    locationId: string;
    name: string;
    type: ResourceType;
    capacity?: number;
}

export interface AbsenceReason {
    id: string;
    name: string;
    description: string;
}

export interface BookingPageConfig {
    id: string;
    slug: string;
    title: string;
    resourceIds: string[];
    slotDuration: number;
    isEnabled: boolean;
    description?: string;
}

export interface LinkGenerator {
    id: string;
    name: string;
    type: LinkGeneratorType;
    targetId?: string;
    targetType?: 'membership' | 'serviciu' | 'oferta_speciala';
    slug: string;
    hits: number;
    createdAt: string;
    isEnabled: boolean;
    heroText?: string;
    theme?: 'modern' | 'fitness_dark' | 'bright_energetic';
    protection?: {
        enabled: boolean;
        type: 'card_on_file' | 'deposit' | 'full_payment';
        feeAmount: number;
    };
    dynamicPricing?: {
        enabled: boolean;
        occupancyThreshold: number;
        priceMultiplier: number;
    };
}

export type LinkGeneratorType = 'page' | 'service' | 'booking' | 'form' | 'offer';

export interface Channel {
    id: string;
    name: string;
    type: 'public' | 'private';
    participantIds: string[];
    createdAt: string;
    linkedTaskIds?: string[];
}

export interface Message {
    id: string;
    channelId: string;
    authorId: string;
    content: string;
    createdAt: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
}

export interface TrainerReview {
    id: string;
    trainerId: string;
    memberId: string;
    stars: number;
    comment: string;
    date: string;
}
