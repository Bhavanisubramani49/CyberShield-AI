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
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { NavigationPage, SystemHealth, UserProfile, AuthScreen, ThemeMode } from './types';
import { fetchHealth } from './services/api';
import { getStoredUser, setStoredUser, getStoredTheme, setStoredTheme, DEFAULT_USER } from './services/auth';

export const App: React.FC = () => {
  // Authentication & Session State
  const [user, setUser] = useState<UserProfile | null>(() => {
    return getStoredUser() || DEFAULT_USER; // Pre-seeded with Dr. Alex Vance for immediate usability
  });
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  // Navigation & Theme State
  const [currentPage, setPage] = useState<NavigationPage>('home');
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [deviceMode, setDeviceMode] = useState<'windows' | 'android'>('windows');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Initialize Theme and Health check on load
  useEffect(() => {
    setStoredTheme(theme);
    fetchHealth().then((data) => setHealth(data));
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setStoredUser(loggedInUser);
    setPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setStoredUser(null);
    setAuthScreen('login');
  };

  return (
    <div className="cyber-bg-pattern" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header with live API health, user profile chip, theme switcher, and device toggle */}
      <Header 
        health={health}
        user={user}
        deviceMode={deviceMode} 
        setDeviceMode={setDeviceMode}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        theme={theme}
        setTheme={handleThemeChange}
        setPage={setPage}
        onLogout={handleLogout}
      />

      {/* Android Mobile Drawer Menu */}
      {user && (
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentPage={currentPage}
          setPage={setPage}
          user={user}
          theme={theme}
          setTheme={handleThemeChange}
          onLogout={handleLogout}
        />
      )}

      {/* Main App Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: deviceMode === 'android' ? '20px 8px' : '0'
      }}>
        <div style={{
          width: deviceMode === 'android' ? '430px' : '100%',
          maxWidth: deviceMode === 'android' ? '430px' : '100%',
          background: deviceMode === 'android' ? 'var(--bg-sidebar)' : 'transparent',
          border: deviceMode === 'android' ? '2px solid var(--border-green)' : 'none',
          borderRadius: deviceMode === 'android' ? '28px' : '0',
          boxShadow: deviceMode === 'android' ? '0 0 35px var(--shadow-green)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          minHeight: deviceMode === 'android' ? '840px' : 'calc(100vh - 65px)',
          position: 'relative',
          transition: 'all 0.25s ease'
        }}>
          {/* If unauthenticated, show Authentication Screens */}
          {!user ? (
            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              {authScreen === 'login' && (
                <LoginPage 
                  setAuthScreen={setAuthScreen} 
                  onLoginSuccess={handleLoginSuccess} 
                />
              )}
              {authScreen === 'register' && (
                <RegisterPage 
                  setAuthScreen={setAuthScreen} 
                  onLoginSuccess={handleLoginSuccess} 
                />
              )}
              {authScreen === 'forgot_password' && (
                <ForgotPasswordPage 
                  setAuthScreen={setAuthScreen} 
                />
              )}
            </main>
          ) : (
            /* If authenticated, show Protected Pages */
            <div className="app-layout" style={{ width: '100%' }}>
              {/* Windows Desktop Navigation Sidebar */}
              {deviceMode === 'windows' && (
                <Sidebar 
                  currentPage={currentPage} 
                  setPage={setPage} 
                  user={user} 
                />
              )}

              {/* Main Content Viewport */}
              <main className="main-viewport">
                <div className="page-container">
                  {currentPage === 'home' && <HomePage health={health} />}
                  {currentPage === 'sender' && <SenderPage />}
                  {currentPage === 'receiver' && <ReceiverPage />}
                  {currentPage === 'dashboard' && <DashboardPage health={health} />}
                  {currentPage === 'history' && <HistoryPage />}
                  {currentPage === 'settings' && <SettingsPage theme={theme} setTheme={handleThemeChange} />}
                  {currentPage === 'profile' && (
                    <ProfilePage 
                      user={user} 
                      theme={theme} 
                      setTheme={handleThemeChange} 
                      onLogout={handleLogout} 
                    />
                  )}
                </div>
              </main>
            </div>
          )}

          {/* Android Mobile Bottom Navigation Bar (for logged-in mobile view) */}
          {user && deviceMode === 'android' && (
            <MobileBottomNav currentPage={currentPage} setPage={setPage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
