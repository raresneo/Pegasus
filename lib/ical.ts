import { Booking, Member, Resource } from '../types';

// Function to format a date into iCal UTC format (YYYYMMDDTHHMMSSZ)
const toIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export const generateIcsContent = (bookings: Booking[], members: Member[], resources: Resource[]): string => {
    const memberMap = new Map(members.map(m => [m.id, m]));
    const resourceMap = new Map(resources.map(r => [r.id, r]));

    let icsString = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Fitable//Gym Management//EN',
        'CALSCALE:GREGORIAN'
    ].join('\r\n');

    bookings.forEach(booking => {
        // Skip recurring templates, only export instances or single bookings
        if (booking.recurrence) return;

        const resource = resourceMap.get(booking.resourceId);
        const member = booking.memberId ? memberMap.get(booking.memberId) : null;

        let description = `Resource: ${resource?.name || 'N/A'}.`;
        if (member) {
            description += `\\nClient: ${member.firstName} ${member.lastName}.`;
        }

        const startDate = new Date(booking.startTime);
        const endDate = new Date(booking.endTime);
        const now = new Date();

        const uid = `${booking.id.split('_')[0]}@fitable.com`;

        const event = [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${toIcsDate(now)}`,
            `DTSTART:${toIcsDate(startDate)}`,
            `DTEND:${toIcsDate(endDate)}`,
            `SUMMARY:${booking.title}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${resource?.name || 'Fitable Gym'}`,
        ];

        event.push('END:VEVENT');
        icsString += '\r\n' + event.join('\r\n');
    });

    icsString += '\r\nEND:VCALENDAR';

    return icsString;
};
