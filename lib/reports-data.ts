import * as Icons from '../components/icons';

// FIX: Add 'as const' to ensure TypeScript infers the literal types for `changeType`,
// which satisfies the `KPIWidget` component's prop type of `'increase' | 'decrease'`.
export const kpiData = {
    totalRevenue: { value: 'Lei 9,258.09', change: '+12.5%', changeType: 'increase' },
    newMembers: { value: '12', change: '-8.3%', changeType: 'decrease' },
    activeMembers: { value: '189', change: '+2.1%', changeType: 'increase' },
    churnRate: { value: '2.4%', change: '+0.5%', changeType: 'decrease' },
    avgAttendance: { value: '78%', change: '+5%', changeType: 'increase' },
    posSales: { value: 'Lei 1,204.50', change: '+20%', changeType: 'increase' },
} as const;

export const reportCategories = [
    { id: 'dashboard', name: 'Dashboard', icon: Icons.HomeIcon },
    { id: 'member', name: 'Member', icon: Icons.UsersIcon },
    { id: 'financial', name: 'Financial', icon: Icons.CurrencyDollarIcon },
    { id: 'booking', name: 'Booking', icon: Icons.CalendarIcon },
    { id: 'retention', name: 'Retention', icon: Icons.ArrowTrendingUpIcon },
    { id: 'prospect', name: 'Prospect', icon: Icons.UserAddIcon },
    { id: 'staff', name: 'Staff', icon: Icons.UserCircleIcon },
    { id: 'pos', name: 'Till / POS', icon: Icons.ShoppingCartIcon },
];

export const predefinedReports = [
    // Member
    { id: 'mem_01', category: 'member', name: 'Current Members List', description: 'A full list of all active and frozen members.', isFavorite: true },
    { id: 'mem_02', category: 'member', name: 'New Members This Month', description: 'Members who joined in the current calendar month.', isFavorite: false },
    { id: 'mem_03', category: 'member', name: 'Expiring Memberships', description: 'Memberships set to expire in the next 30 days.', isFavorite: true },
    { id: 'mem_04', category: 'member', name: 'Member Birthdays', description: 'Upcoming member birthdays this month.', isFavorite: false },
    // Financial
    { id: 'fin_01', category: 'financial', name: 'Monthly Revenue Summary', description: 'A summary of all revenue streams for the month.', isFavorite: true },
    { id: 'fin_02', category: 'financial', name: 'Sales by Item', description: 'Detailed report of sales from the Point of Sale.', isFavorite: false },
    { id: 'fin_03', category: 'financial', name: 'Failed Payments', description: 'List of all failed or declined payments.', isFavorite: false },
    { id: 'fin_04', category: 'financial', name: 'Members with Debt', description: 'A list of members with an outstanding balance.', isFavorite: true },
    // Booking
    { id: 'book_01', category: 'booking', name: 'Class Attendance', description: 'Attendance records for all scheduled classes.', isFavorite: false },
    { id: 'book_02', category: 'booking', name: 'Resource Utilization', description: 'Shows how frequently rooms and equipment are booked.', isFavorite: false },
    // Retention
    { id: 'ret_01', category: 'retention', name: 'Member Churn Analysis', description: 'Analyzes the rate at which members are cancelling.', isFavorite: true },
    { id: 'ret_02', category: 'retention', name: 'Last Visit Report', description: 'Shows members who have not visited in over 30 days.', isFavorite: false },
];

export const customReportBuilderFields = {
    member: [
        { id: 'firstName', name: 'First Name', type: 'string' },
        { id: 'lastName', name: 'Last Name', type: 'string' },
        { id: 'email', name: 'Email', type: 'string' },
        { id: 'joinDate', name: 'Join Date', type: 'date' },
        { id: 'membership.status', name: 'Membership Status', type: 'enum', options: ['active', 'frozen', 'cancelled', 'expired'] },
        { id: 'dob', name: 'Date of Birth', type: 'date' },
    ],
    financial: [
        { id: 'payment.date', name: 'Payment Date', type: 'date' },
        { id: 'payment.amount', name: 'Amount', type: 'number' },
        { id: 'payment.description', name: 'Description', type: 'string' },
        { id: 'payment.method', name: 'Payment Method', type: 'enum', options: ['Card', 'Cash', 'Other'] },
        { id: 'member.fullName', name: 'Member Name', type: 'string' },
    ],
    booking: [
        { id: 'booking.startTime', name: 'Start Time', type: 'datetime' },
        { id: 'booking.title', name: 'Booking Title', type: 'string' },
        { id: 'resource.name', name: 'Resource', type: 'string' },
        { id: 'member.fullName', name: 'Member Name', type: 'string' },
    ],
};