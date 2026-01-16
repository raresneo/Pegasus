
import { Member, Booking, NotificationTemplate, MessageLocalizationSettings, User, Resource, Location } from '../types';
import { format, parseISO } from 'date-fns';
import { ro, enUS } from 'date-fns/locale';

interface TemplateVariables {
    [key: string]: string;
}

const replaceVariables = (content: string, vars: TemplateVariables) => {
    let result = content;
    Object.keys(vars).forEach(key => {
        const placeholder = `{{${key}}}`;
        const value = vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : '';
        result = result.split(placeholder).join(value);
    });
    return result;
};

/**
 * Generează link-uri directe către WhatsApp, Email și SMS.
 * Suportă atât mesaje legate de programări, cât și mesaje generice de contact.
 */
export const generateNotificationUrls = (
    member: Member, 
    booking?: Booking, 
    templates: NotificationTemplate[] = [], 
    localization: MessageLocalizationSettings = { language: 'ro', timeFormat: '24h', dateFormat: 'dd/MM/yyyy' },
    staff?: User,
    resource?: Resource,
    location?: Location
) => {
    const locale = localization.language === 'ro' ? ro : enUS;
    const timeFmt = localization.timeFormat === '24h' ? 'HH:mm' : 'hh:mm a';
    
    // Dicționar de mesaje rapide localizate
    const quickMessages = {
        ro: {
            hello: `Salut, {{clientFirstName}}! Sperăm că ești bine. Te contactăm de la {{location}}...`,
            payment: `Bună, {{clientFirstName}}! Reamintim că abonamentul tău la {{location}} necesită reînnoire.`,
            generic: `Bună ziua, {{name}}! Vă contactăm în legătură cu profilul dvs. de membru la {{location}}.`
        },
        en: {
            hello: `Hi, {{clientFirstName}}! We hope you're doing well. Contacting you from {{location}}...`,
            payment: `Hello, {{clientFirstName}}! This is a reminder that your {{location}} membership needs renewal.`,
            generic: `Hello, {{name}}! We are contacting you regarding your membership profile at {{location}}.`
        }
    };

    const currentLang = localization.language === 'ro' ? 'ro' : 'en';

    const vars: TemplateVariables = {
        name: `${member.firstName} ${member.lastName}`,
        clientFirstName: member.firstName,
        location: location?.name || 'Pegasus Elite Hub',
        businessName: location?.name || 'Pegasus Elite Hub',
        phoneNumber: member.phone,
        staffName: staff?.name || resource?.name || 'Echipa Pegasus',
        bookingLink: `${window.location.origin}/member-portal`,
        date: booking ? format(parseISO(booking.startTime), localization.dateFormat || 'dd/MM/yyyy', { locale }) : '',
        startTime: booking ? format(parseISO(booking.startTime), timeFmt) : '',
        service: booking?.title || 'serviciile noastre'
    };

    const cleanPhone = member.phone.replace(/\D/g, '');
    const result: Record<string, any> = { whatsapp: {}, sms: {}, email: {} };

    // 1. Adăugăm mesajele rapide predefinite
    const helloText = replaceVariables(quickMessages[currentLang].hello, vars);
    const paymentText = replaceVariables(quickMessages[currentLang].payment, vars);

    result.whatsapp.direct = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(helloText)}`;
    result.whatsapp.payment = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(paymentText)}`;
    
    result.email.direct = `mailto:${member.email}?subject=Salut%20de%20la%20Pegasus&body=${encodeURIComponent(helloText)}`;
    result.sms.direct = `sms:${member.phone}?body=${encodeURIComponent(helloText)}`;

    // 2. Procesăm template-urile din baza de date dacă există
    templates.forEach(t => {
        const text = replaceVariables(t.content, vars);
        const encodedText = encodeURIComponent(text);
        if (t.channel === 'whatsapp') result.whatsapp[t.type] = `https://wa.me/${cleanPhone}?text=${encodedText}`;
        else if (t.channel === 'sms') result.sms[t.type] = `sms:${member.phone}?body=${encodedText}`;
        else if (t.channel === 'email') result.email[t.type] = `mailto:${member.email}?subject=${encodeURIComponent(t.name)}&body=${encodedText}`;
    });

    return result;
};
