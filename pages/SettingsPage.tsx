
import React from 'react';
import { MenuItem } from '../types';
import AdvancedConfigurationPage from '../components/settings/AdvancedConfigurationPage';
import ClubDetailsSettings from '../components/settings/ClubDetailsSettings';
import BusinessModelHub from '../components/settings/hubs/BusinessModelHub';
import OperationsHub from '../components/settings/hubs/OperationsHub';
import CRMHub from '../components/settings/hubs/CRMHub';
import TechnicalHub from '../components/settings/hubs/TechnicalHub';
import PlaceholderPage from './PlaceholderPage';

interface SettingsPageProps {
    currentPage: MenuItem;
    onNavigate: (item: MenuItem) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentPage, onNavigate }) => {

    const renderSettingsContent = () => {
        switch (currentPage.id) {
            case 'settings-club':
                return <ClubDetailsSettings />;
            case 'settings-business':
                return <BusinessModelHub />;
            case 'settings-crm':
                return <CRMHub />;
            case 'settings-operations':
                return <OperationsHub />;
            case 'settings-technical':
                return <TechnicalHub />;
            case 'settings':
            case 'settings-advanced':
                return <AdvancedConfigurationPage onNavigate={onNavigate} />;
            default:
                return <PlaceholderPage title={currentPage.label} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {renderSettingsContent()}
        </div>
    );
};

export default SettingsPage;
