
import React from 'react';
import { MenuItem } from '../types';
import AdvancedConfigurationPage from '../components/settings/AdvancedConfigurationPage';
import ClubDetailsSettings from '../components/settings/ClubDetailsSettings';
import FinancialConfigSettings from '../components/settings/FinancialConfigSettings';
import MembershipTypesSettings from '../components/settings/MembershipTypesSettings';
import ProductsSettings from '../components/settings/ProductsSettings';
import BookingClassesSettings from '../components/settings/BookingClassesSettings';
import UserAdminSettings from '../components/settings/UserAdminSettings';
import IntegrationsSettings from '../components/settings/IntegrationsSettings';
import AIFeaturesPage from '../components/settings/AIFeaturesPage';
import TrainAgents from '../components/settings/ai/TrainAgents';
import Automations from '../components/settings/ai/Automations';
import ActivityLogPage from '../components/settings/ActivityLogPage';
import FiltersTagsSettings from '../components/settings/FiltersTagsSettings';
import ClientRegistrationSettings from '../components/settings/ClientRegistrationSettings';
import AbsenceReasonsSettings from '../components/settings/AbsenceReasonsSettings';
import CustomFieldsSettings from '../components/settings/CustomFieldsSettings';
import PlaceholderPage from './PlaceholderPage';


interface SettingsPageProps {
    currentPage: MenuItem;
    onNavigate: (item: MenuItem) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentPage, onNavigate }) => {

    const renderSettingsContent = () => {
        switch (currentPage.id) {
            case 'settings-advanced':
                return <AdvancedConfigurationPage onNavigate={onNavigate} />;
            case 'settings-club':
                return <ClubDetailsSettings />;
            case 'settings-registration-link':
                return <ClientRegistrationSettings />;
            case 'settings-financial':
                return <FinancialConfigSettings />;
            case 'settings-membership':
                return <MembershipTypesSettings />;
            case 'settings-products':
                return <ProductsSettings />;
            case 'settings-booking':
                return <BookingClassesSettings />;
            case 'settings-absences':
                return <AbsenceReasonsSettings />;
            case 'settings-custom-fields':
                return <CustomFieldsSettings />;
            case 'settings-users':
                return <UserAdminSettings />;
            case 'settings-integrations':
                return <IntegrationsSettings />;
            case 'settings-ai':
                return <AIFeaturesPage onNavigate={onNavigate} />;
            case 'settings-ai-agents':
                return <TrainAgents />;
            case 'settings-ai-automations':
                return <Automations />;
            case 'settings-activity-log':
                return <ActivityLogPage />;
            case 'settings-filters-tags':
                return <FiltersTagsSettings />;
            case 'settings':
                return <AdvancedConfigurationPage onNavigate={onNavigate} />;
            default:
                return <PlaceholderPage title={currentPage.label} />;
        }
    };

    return (
        <div>
            {renderSettingsContent()}
        </div>
    );
};

export default SettingsPage;
