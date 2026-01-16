/**
 * Validation Schemas using Zod
 * Type-safe validation for all entities in the application
 */

import { z } from 'zod';

// ============================================
// MEMBER SCHEMAS
// ============================================

export const AddressSchema = z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
});

export const EmergencyContactSchema = z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().optional(),
    cell: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
    email: z.string().email('Invalid email format').optional(),
});

export const MemberSchema = z.object({
    id: z.string().uuid().optional(),
    locationId: z.string().uuid(),
    memberType: z.enum(['prospect', 'member']),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number').optional(),
    joinDate: z.string().datetime(),
    dob: z.string().datetime(),
    gender: z.string().optional(),
    occupation: z.string().optional(),
    organization: z.string().optional(),
    salesRep: z.string().optional(),
    sourcePromotion: z.string().optional(),
    referredBy: z.string().optional(),
    trainer: z.string().optional(),
    tags: z.array(z.string()).optional(),
    involvementType: z.string().optional(),
    title: z.string().optional(),
    address: AddressSchema,
    emergencyContact: EmergencyContactSchema,
    notes: z.string().optional(),
    healthScore: z.number().min(0).max(100).optional(),
    customFields: z.record(z.any()).optional(),
});

export const UpdateMemberSchema = MemberSchema.partial();

// ============================================
// BOOKING SCHEMAS
// ============================================

export const RecurrenceSchema = z.object({
    rule: z.enum(['daily', 'weekly', 'monthly']),
    endDate: z.string().datetime(),
    exceptionDates: z.array(z.string().datetime()).optional(),
});

export const BookingSchema = z.object({
    id: z.string().uuid().optional(),
    seriesId: z.string().uuid().optional(),
    locationId: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    resourceId: z.string().uuid(),
    memberId: z.string().uuid().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    color: z.enum(['blue', 'green', 'purple', 'orange', 'red', 'gray']).default('blue'),
    status: z.enum(['scheduled', 'attended', 'no-show', 'cancelled']).default('scheduled'),
    recurrence: RecurrenceSchema.optional(),
    isException: z.boolean().default(false),
}).refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    { message: 'End time must be after start time', path: ['endTime'] }
);

export const UpdateBookingSchema = BookingSchema.partial();

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const PaymentSchema = z.object({
    id: z.string().uuid().optional(),
    memberId: z.string().uuid(),
    locationId: z.string().uuid(),
    amount: z.number().positive('Amount must be positive'),
    date: z.string().datetime(),
    description: z.string().min(1, 'Description is required'),
    method: z.enum(['Card', 'Cash', 'Stripe', 'Other']).optional(),
    stripeRef: z.string().optional(),
    status: z.enum(['succeeded', 'pending', 'failed']).default('pending'),
});

export const UpdatePaymentSchema = PaymentSchema.partial();

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const ProductSchema = z.object({
    id: z.string().uuid().optional(),
    locationId: z.string().uuid(),
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    reorderPoint: z.number().int().min(0).default(10),
});

export const UpdateProductSchema = ProductSchema.partial();

// ============================================
// TASK SCHEMAS
// ============================================

export const TaskChecklistItemSchema = z.object({
    id: z.string().uuid().optional(),
    text: z.string().min(1, 'Checklist item text is required'),
    completed: z.boolean().default(false),
});

export const TaskSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Task name is required'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'pending', 'completed']).default('todo'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    endDate: z.string().datetime(),
    assigneeId: z.string().uuid().nullable(),
    isArchived: z.boolean().default(false),
    checklist: z.array(TaskChecklistItemSchema).optional(),
    parentId: z.string().uuid().optional(),
    dependencies: z.array(z.string().uuid()).optional(),
    recurrence: RecurrenceSchema.optional(),
    seriesId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional(),
});

export const UpdateTaskSchema = TaskSchema.partial();

// ============================================
// PROSPECT SCHEMAS
// ============================================

export const ProspectSchema = z.object({
    id: z.string().uuid().optional(),
    locationId: z.string().uuid(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number').optional(),
    status: z.enum(['uncontacted', 'contacted', 'trial', 'won']).default('uncontacted'),
    lastContacted: z.string().datetime().optional(),
    assignedTo: z.string().uuid(),
    tags: z.array(z.string()).default([]),
    avatar: z.string().optional(),
});

export const UpdateProspectSchema = ProspectSchema.partial();

// ============================================
// ASSET SCHEMAS
// ============================================

export const AssetSchema = z.object({
    id: z.string().uuid().optional(),
    locationId: z.string().uuid(),
    name: z.string().min(1, 'Asset name is required'),
    category: z.string().min(1, 'Category is required'),
    lastMaintenance: z.string().datetime().optional(),
    nextMaintenance: z.string().datetime(),
    status: z.enum(['operational', 'repair', 'needs_service']).default('operational'),
});

export const UpdateAssetSchema = AssetSchema.partial();

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
}).refine(
    (data) => data.password === data.confirmPassword,
    { message: 'Passwords do not match', path: ['confirmPassword'] }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate data against a Zod schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Parsed data if valid
 * @throws ValidationError if invalid
 */
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string[]> = {};
            error.errors.forEach((err) => {
                const path = err.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(err.message);
            });

            throw new Error(JSON.stringify({
                message: 'Validation failed',
                errors
            }));
        }
        throw error;
    }
};

/**
 * Safe parse - returns result instead of throwing
 */
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown) => {
    return schema.safeParse(data);
};
