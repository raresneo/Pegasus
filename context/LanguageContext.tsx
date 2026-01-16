
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'en' | 'ro';

interface Translations {
  [key: string]: {
    ro: string;
    en: string;
  };
}

export const translations: Translations = {
  // Brand
  'brand.name': { ro: 'Pegas', en: 'Pegas' },
  'brand.motto': { ro: 'Excelență în Mișcare', en: 'Excellence in Motion' },

  // Navigation
  'menu.home': { ro: 'Dashboard Control', en: 'Control Dashboard' },
  'menu.terminal': { ro: 'Terminal Acces', en: 'Access Terminal' },
  'menu.members': { ro: 'Portofoliu Clienți', en: 'Member Hub' },
  'menu.schedule': { ro: 'Agenda Sălii', en: 'Gym Schedule' },
  'menu.pos': { ro: 'Punct de Vânzare', en: 'Point of Sale' },
  'menu.reports': { ro: 'Rapoarte BI', en: 'BI Reports' },
  'menu.tasks': { ro: 'Sarcini Operative', en: 'Operational Tasks' },
  'menu.assets': { ro: 'Gestiune Active', en: 'Asset Manager' },
  'menu.chat': { ro: 'Centru Mesaje', en: 'Message Center' },
  'menu.settings': { ro: 'Configurare Hub', en: 'Hub Settings' },
  'menu.settings.club': { ro: 'Identitate Club', en: 'Club Identity' },

  // Settings Modules
  'settings.modules.title': { ro: 'Module Vizibile', en: 'Visible Modules' },
  'settings.modules.desc': { ro: 'Personalizează experiența de navigare activând sau dezactivând modulele din bara laterală.', en: 'Customize the navigation experience by enabling or disabling sidebar modules.' },
  'settings.modules.safeguard': { ro: 'Modulele fundamentale (Dashboard, Setări) sunt mereu active pentru a asigura integritatea controlului.', en: 'Core modules (Dashboard, Settings) are always active to ensure control integrity.' },

  // Dashboard
  'dash.title': { ro: 'Consola Centrală Pegas', en: 'Pegas Command Center' },
  'dash.subtitle': { ro: 'Analiză în timp real a performanței operaționale', en: 'Real-time operational performance analysis' },
  'dash.revenue': { ro: 'Venit Lună (MTD)', en: 'Monthly Revenue (MTD)' },
  'dash.churn': { ro: 'Risc Atriție Client', en: 'Member Churn Risk' },
  'dash.stock': { ro: 'Alerte Stoc POS', en: 'POS Stock Alerts' },
  'dash.community': { ro: 'Membri Valizi', en: 'Active Community' },
  'dash.traffic': { ro: 'Flux Vizitatori', en: 'Visitor Flow' },
  'dash.status': { ro: 'Distribuție Contracte', en: 'Contract Mix' },
  'dash.ai_engine': { ro: 'Motor Heuristic MyBrain™', en: 'MyBrain™ Heuristic Engine' },
  'dash.ai_desc': { ro: 'Analizez comportamentul clienților și propun strategii automate de retenție.', en: 'Analyzing member behavior and suggesting automated retention strategies.' },
  'dash.actions': { ro: 'Lansator Acțiuni', en: 'Action Launcher' },
  'dash.action.checkin': { ro: 'Check-in Manual', en: 'Manual Check-in' },
  'dash.action.sale': { ro: 'Vânzare Rapidă', en: 'Quick Sale' },
  'dash.action.member': { ro: 'Înregistrare Membru', en: 'Member Sign-up' },

  // Common UI
  'common.save': { ro: 'Salvează Modificările', en: 'Save Changes' },
  'common.cancel': { ro: 'Anulează', en: 'Cancel' },
  'common.search': { ro: 'Caută în sistem...', en: 'Search system...' },
  'common.logout': { ro: 'Deconectare', en: 'System Logout' },
  'common.language': { ro: 'Limba Sistemului', en: 'System Language' },
  'common.language_desc': { ro: 'Alege limba preferată pentru interfața Pegas.', en: 'Choose your preferred Pegas language.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('pegas_lang') as Language) || 'ro';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pegas_lang', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
