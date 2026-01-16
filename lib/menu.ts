
import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'menu.home',
    icon: 'HomeIcon',
    roles: ['admin', 'trainer', 'member'],
    description: 'Statistici vitale, scoruri de retenție și activitate live.'
  },
  {
    id: 'terminal',
    label: 'menu.terminal',
    icon: 'IdentificationIcon',
    roles: ['admin', 'trainer'],
    description: 'Interfață kiosk pentru scanare coduri QR și check-in rapid.'
  },
  {
    id: 'members-hub',
    label: 'menu.members',
    icon: 'UsersIcon',
    roles: ['admin', 'trainer'],
    description: 'Management membri, loialitate și monitorizare churn.'
  },
  {
    id: 'schedule',
    label: 'menu.schedule',
    icon: 'CalendarIcon',
    roles: ['admin', 'trainer', 'member'],
    description: 'Calendarul centralizat pentru clase și PT.'
  },
  {
    id: 'pos',
    label: 'menu.pos',
    icon: 'ShoppingCartIcon',
    roles: ['admin', 'trainer'],
    description: 'Vânzare produse și servicii. Gestiune stocuri în timp real.'
  },
  {
    id: 'reports',
    label: 'menu.reports',
    icon: 'ChartBarIcon',
    roles: ['admin'],
    description: 'Analiză BI, venituri, tendințe și performanță staff.'
  },
  {
    id: 'tasks',
    label: 'menu.tasks',
    icon: 'ClipboardListIcon',
    roles: ['admin', 'trainer'],
    description: 'Sarcini operative și workflow-uri interne.'
  },
  {
    id: 'assets',
    label: 'menu.assets',
    icon: 'WrenchScrewdriverIcon',
    roles: ['admin'],
    description: 'Managementul echipamentelor și mentenanță preventivă.'
  },
  {
    id: 'chat',
    label: 'menu.chat',
    icon: 'ChatBubbleLeftEllipsisIcon',
    roles: ['admin', 'trainer'],
    description: 'Comunicare securizată între angajați.'
  },
  {
    id: 'settings',
    label: 'menu.settings',
    icon: 'CogIcon',
    roles: ['admin'],
    children: [
      { id: 'settings-club', label: 'Identitate & Locale', icon: 'IdentificationIcon', roles: ['admin'], description: 'Branding, limbi și configurări financiare.' },
      { id: 'settings-business', label: 'Model de Business', icon: 'TicketIcon', roles: ['admin'], description: 'Abonamente, Servicii și Oferte Speciale.' },
      { id: 'settings-crm', label: 'Growth & CRM', icon: 'GlobeAltIcon', roles: ['admin'], description: 'Link-uri înscriere, loialitate și portal membri.' },
      { id: 'settings-operations', label: 'Operațiuni & Acces', icon: 'AdjustmentsIcon', roles: ['admin'], description: 'Reguli agendă, terminal și active.' },
      { id: 'settings-custom-fields', label: 'Câmpuri Personalizate', icon: 'ViewGridAddIcon', roles: ['admin'], description: 'Extinde profilele membrilor cu atribute proprii.' },
      { id: 'settings-technical', label: 'Echipă & Sistem', icon: 'KeyIcon', roles: ['admin'], description: 'Vizibilitate module, staff și jurnale audit.' },
    ],
  },
];
