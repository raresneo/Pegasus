import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Assuming react-router is used, or will use logic matching App.tsx
import Sidebar from './Sidebar'; // Existing, might need update
import Header from './Header';   // Existing, might need update
import { MenuItem } from '../types';
import * as Icons from './icons'; // Adjust import if needed

interface LayoutProps {
    children: React.ReactNode;
    menuItems: MenuItem[];
    currentItem: MenuItem;
    onNavigate: (item: MenuItem) => void;
    userRole?: string;
    isSidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    onSearchClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    menuItems,
    currentItem,
    onNavigate,
    isSidebarOpen,
    setSidebarOpen,
    onSearchClick
}) => {
    // Mobile Bottom Nav Logic
    const mobileMenuItems = menuItems.filter(item => ['home', 'schedule', 'tasks', 'chat'].includes(item.id)).slice(0, 5);

    return (
        <div className="flex h-screen bg-surface-dark text-text-primary overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full">
                <Sidebar
                    isOpen={true} // Always open on desktop for now, or controllable
                    setIsOpen={() => { }} // No-op on desktop fixed
                    currentItem={currentItem}
                    onNavigate={onNavigate}
                    menuItems={menuItems}
                />
            </div>

            <div className="flex-1 flex flex-col h-full relative">
                {/* Header - Simplified for Mobile */}
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    onSearchClick={onSearchClick}
                    currentItem={currentItem}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-4 md:p-6 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-card/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-around px-2 pb-2">
                    {mobileMenuItems.map((item) => {
                        const Icon = (Icons as any)[item.icon || 'HomeIcon'] || Icons.HomeIcon;
                        const isActive = currentItem.id === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item)}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${isActive ? 'text-primary-500' : 'text-text-secondary hover:text-white'}`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-500/10' : ''}`}>
                                    <Icon className={`w-6 h-6 ${isActive ? 'transform scale-110' : ''}`} />
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-text-secondary hover:text-white"
                    >
                        <div className="p-1.5">
                            <Icons.MenuIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium">Meniu</span>
                    </button>
                </div>

                {/* Mobile Slide-over Menu (Sidebar used as drawer) */}
                <div className={`md:hidden fixed inset-0 z-[60] transform -translate-x-full transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="relative w-3/4 max-w-xs h-full bg-surface-card shadow-2xl">
                        <Sidebar
                            isOpen={true}
                            setIsOpen={setSidebarOpen}
                            currentItem={currentItem}
                            onNavigate={(item) => {
                                onNavigate(item);
                                setSidebarOpen(false);
                            }}
                            menuItems={menuItems}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Layout;
