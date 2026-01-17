
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import FitableCopilot from './components/GymMasterCopilot';
import CommandPalette from './components/CommandPalette';
import GlobalSearch from './components/GlobalSearch';
import Footer from './components/Footer';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { useKeyPress } from './hooks/useKeyPress';
import { MenuItem, UserRole, CopilotAction, Member } from './types';
import { menuItems } from './lib/menu';
import { useAuth } from './context/AuthContext';
import { useDatabase } from './context/DatabaseContext';
import { CopilotContext } from './context/CopilotContext';
import { CartProvider } from './context/CartContext';
import MembershipSignUpPage from './pages/MembershipSignUpPage';
import AccessTerminalPage from './pages/AccessTerminalPage';
import SelfCheckInPage from './pages/SelfCheckInPage';
import { findMenuItemById } from './lib/utils';

// Lazy-loaded page components
const Dashboard = lazy(() => import('./components/Dashboard'));
const MemberDashboard = lazy(() => import('./components/MemberDashboard'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const MembersManagementPage = lazy(() => import('./pages/MembersManagementPage'));
const MemberDetailPage = lazy(() => import('./pages/MemberDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const VisitorsPage = lazy(() => import('./pages/VisitorsPage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const ReferralsPage = lazy(() => import('./pages/ReferralsPage'));
const StaffManagementPage = lazy(() => import('./pages/StaffManagementPage'));
const NotificationSettingsPage = lazy(() => import('./pages/NotificationSettingsPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const ClientDashboard = lazy(() => import('./components/ClientDashboard'));
const ClientProfilePage = lazy(() => import('./pages/ClientProfilePage'));
const ClientBookingsPage = lazy(() => import('./pages/ClientBookingsPage'));
const ClientPaymentsPage = lazy(() => import('./pages/ClientPaymentsPage'));
const ClientProductsPage = lazy(() => import('./pages/ClientProductsPage'));
const ClientProgressPage = lazy(() => import('./pages/ClientProgressPage'));
const AdminProgressPage = lazy(() => import('./pages/AdminProgressPage'));

const filterMenuByRole = (items: MenuItem[], role: UserRole): MenuItem[] => {
  return items
    .filter(item => item.roles.includes(role))
    .map(item => {
      if (item.children) {
        return { ...item, children: filterMenuByRole(item.children, role) };
      }
      return item;
    });
};

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full py-20">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { members } = useDatabase();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const userMenu = useMemo(() => {
    if (!user) return [];
    return filterMenuByRole(menuItems, user.role);
  }, [user]);

  const [currentPage, setCurrentPage] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (userMenu.length > 0 && !currentPage) {
      setCurrentPage(userMenu[0]);
    }
  }, [userMenu, currentPage]);

  const [navigationContext, setNavigationContext] = useState<any>(null);
  const [isCopilotOpen, setCopilotOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [copilotActions, setCopilotActions] = useState<CopilotAction[]>([]);
  const [memberInDetail, setMemberInDetail] = useState<Member | null>(null);

  const registerActions = useCallback((newActions: CopilotAction[]) => {
    setCopilotActions(newActions);
  }, []);

  const unregisterActions = useCallback(() => {
    setCopilotActions([]);
  }, []);

  const handleNavigation = useCallback((item: MenuItem, context: any = null) => {
    setMemberInDetail(null);
    setCurrentPage(item);
    setNavigationContext(context);
    setGlobalSearchOpen(false);
    setCommandPaletteOpen(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleViewMember = useCallback((member: Member) => {
    setMemberInDetail(member);
    setGlobalSearchOpen(false);
    setCommandPaletteOpen(false);
  }, []);

  useKeyPress(['k'], (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      setCommandPaletteOpen(p => !p);
      setGlobalSearchOpen(false);
    }
  });

  const renderPage = () => {
    const scheduleMenuItem = findMenuItemById(userMenu, 'schedule');
    const myProfileMenuItem = findMenuItemById(userMenu, 'my-profile');

    if (memberInDetail) {
      return <MemberDetailPage
        member={memberInDetail}
        onBack={() => setMemberInDetail(null)}
        onNavigate={(item, context) => handleNavigation(item, context)}
        scheduleMenuItem={scheduleMenuItem}
      />;
    }

    if (user?.role === 'member') {
      const member = members.find(m => m.email === user.email);
      if (!member) return <PlaceholderPage title="Profilul nu a fost găsit" />;

      switch (currentPage?.id) {
        case 'home':
          return <ClientDashboard member={member} onNavigate={handleNavigation} />;
        case 'schedule':
          return <SchedulePage navigationContext={{ memberId: member.id }} />;
        case 'my-profile':
          return <ClientProfilePage
            member={member}
            onBack={() => handleNavigation(userMenu[0])}
            onNavigate={(item, context) => handleNavigation(item, context)}
          />;
        case 'my-bookings':
          return <ClientBookingsPage
            member={member}
            onBack={() => handleNavigation(userMenu[0])}
          />;
        case 'payments':
          return <ClientPaymentsPage
            member={member}
            onBack={() => handleNavigation(userMenu[0])}
          />;
        case 'products':
          return <ClientProductsPage
            member={member}
            onBack={() => handleNavigation(userMenu[0])}
          />;
        case 'my-progress':
          return <ClientProgressPage
            member={member}
            onBack={() => handleNavigation(userMenu[0])}
          />;
        case 'referrals':
          return <ReferralsPage />;
        default:
          return <PlaceholderPage title={currentPage?.label || 'Bun venit'} />;
      }
    }

    if (!currentPage) return <LoadingSpinner />;

    if (currentPage.id.startsWith('settings')) {
      if (currentPage.id === 'settings-notifications') return <NotificationSettingsPage />;
      return <SettingsPage currentPage={currentPage} onNavigate={handleNavigation} />;
    }

    switch (currentPage.id) {
      case 'home':
        return <Dashboard onNavigate={handleNavigation} />;
      case 'terminal':
        return <AccessTerminalPage />;
      case 'members-hub':
        return <MembersManagementPage onViewMember={handleViewMember} navigationContext={navigationContext} />;
      case 'visitors':
        return <VisitorsPage onViewMember={handleViewMember} />;
      case 'schedule':
        return <SchedulePage navigationContext={navigationContext} />;
      case 'staff-management':
        return <StaffManagementPage />;
      case 'referrals':
        return <ReferralsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'chat':
        return <ChatPage />;
      case 'pos':
        return <POSPage />;
      case 'assets':
        return <AssetsPage />;
      case 'members-progress':
        return <AdminProgressPage onBack={() => handleNavigation(userMenu[0])} onViewMember={handleViewMember} />;
      default:
        return <PlaceholderPage title={currentPage.label} />;
    }
  };

  return (
    <CartProvider>
      <CopilotContext.Provider value={{ actions: copilotActions, registerActions, unregisterActions }}>
        <Layout
          menuItems={userMenu}
          currentItem={currentPage || userMenu[0]}
          onNavigate={handleNavigation}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onSearchClick={() => setGlobalSearchOpen(true)}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <div key={currentPage?.id || 'welcome'} className="animate-fade-in-up h-full">
                {renderPage()}
              </div>
            </Suspense>
          </ErrorBoundary>
        </Layout>

        <FitableCopilot isOpen={isCopilotOpen} setIsOpen={setCopilotOpen} />
        <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setCommandPaletteOpen} onNavigate={handleNavigation} onViewMember={handleViewMember} />
        <GlobalSearch isOpen={isGlobalSearchOpen} setIsOpen={setGlobalSearchOpen} onNavigate={handleNavigation} onViewMember={handleViewMember} />
      </CopilotContext.Provider>
    </CartProvider>
  );
}

export default function App() {
  const { loading, isAuthenticated } = useAuth();

  if (window.location.pathname.endsWith('/member-signup')) {
    return <MembershipSignUpPage />;
  }

  if (window.location.pathname.endsWith('/terminal')) {
    return <AccessTerminalPage />;
  }

  if (window.location.pathname.includes('/checkin/')) {
    return <SelfCheckInPage />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-black overflow-hidden">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppContent />;
}
