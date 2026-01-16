
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elementul 'root' nu a fost găsit în DOM.");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <DatabaseProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </DatabaseProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
