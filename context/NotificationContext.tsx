
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import * as Icons from '../components/icons';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-fadeInRight min-w-[320px] ${
              n.type === 'success' ? 'bg-green-500 border-green-400 text-white' :
              n.type === 'error' ? 'bg-red-500 border-red-400 text-white' :
              'bg-white dark:bg-card-dark border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary'
            }`}
          >
            {n.type === 'success' && <Icons.CheckCircleIcon className="w-6 h-6" />}
            {n.type === 'error' && <Icons.XCircleIcon className="w-6 h-6" />}
            {n.type === 'info' && <Icons.InformationCircleIcon className="w-6 h-6 text-primary-500" />}
            <span className="font-bold text-sm">{n.message}</span>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
