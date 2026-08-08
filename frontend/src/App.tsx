import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { SenderPage } from './pages/SenderPage';
import { ReceiverPage } from './pages/ReceiverPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { NavigationPage, SystemHealth } from './types';
import { fetchHealth } from './services/api';

export const App: React.FC = () => {
  // Default screen is 'home' (CyberShield AI / Home)
  const [currentPage, setPage] = useState<NavigationPage>('home');
  const [deviceMode, setDeviceMode] = useState<'windows' | 'android'>('windows');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    fetchHealth().then((data) => setHealth(data));
  }, []);

  return (
    <div className="cyber-bg-pattern" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header with live API health and device mode switcher */}
      <Header 
        health={health} 
        deviceMode={deviceMode} 
        setDeviceMode={setDeviceMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Android Mobile Drawer Menu */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        setPage={setPage}
      />

      {/* Main Responsive App Layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: deviceMode === 'android' ? '20px 8px' : '0'
      }}>
        <div style={{
          width: deviceMode === 'android' ? '430px' : '100%',
          maxWidth: deviceMode === 'android' ? '430px' : '100%',
          background: deviceMode === 'android' ? '#0c121e' : 'transparent',
          border: deviceMode === 'android' ? '2px solid rgba(16, 185, 129, 0.35)' : 'none',
          borderRadius: deviceMode === 'android' ? '28px' : '0',
          boxShadow: deviceMode === 'android' ? '0 0 35px rgba(16, 185, 129, 0.15)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          minHeight: deviceMode === 'android' ? '840px' : 'calc(100vh - 70px)',
          position: 'relative',
          transition: 'all 0.25s ease'
        }}>
          <div className="app-layout" style={{ width: '100%' }}>
            {/* Windows Desktop Navigation Sidebar */}
            {deviceMode === 'windows' && (
              <Sidebar currentPage={currentPage} setPage={setPage} />
            )}

            {/* Main Content Area */}
            <main className="main-viewport">
              <div className="page-container">
                {currentPage === 'home' && <HomePage health={health} />}
                {currentPage === 'sender' && <SenderPage />}
                {currentPage === 'receiver' && <ReceiverPage />}
                {currentPage === 'dashboard' && <DashboardPage health={health} />}
                {currentPage === 'history' && <HistoryPage />}
                {currentPage === 'settings' && <SettingsPage />}
              </div>
            </main>
          </div>

          {/* Android Mobile Bottom Navigation Bar */}
          {deviceMode === 'android' && (
            <MobileBottomNav currentPage={currentPage} setPage={setPage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
