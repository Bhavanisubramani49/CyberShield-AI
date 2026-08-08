import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PlatformSelector } from './components/layout/PlatformSelector';
import { DashboardPage } from './pages/DashboardPage';
import { SenderPage } from './pages/SenderPage';
import { ReceiverPage } from './pages/ReceiverPage';
import { SecurityEnginePage } from './pages/SecurityEnginePage';
import { PlatformMode, SystemHealth } from './types';
import { fetchHealth } from './services/api';

export const App: React.FC = () => {
  const [currentMode, setMode] = useState<PlatformMode>('dashboard');
  const [deviceMode, setDeviceMode] = useState<'windows' | 'android'>('windows');
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    fetchHealth().then((data) => setHealth(data));
  }, []);

  return (
    <div className="cyber-bg-grid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header health={health} deviceMode={deviceMode} setDeviceMode={setDeviceMode} />

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: deviceMode === 'android' ? '20px 10px' : '0'
      }}>
        {/* Device Wrapper: Switch between Windows Desktop and Android Mobile Viewport */}
        <div style={{
          width: deviceMode === 'android' ? '420px' : '100%',
          maxWidth: deviceMode === 'android' ? '420px' : '100%',
          background: deviceMode === 'android' ? 'rgba(7, 10, 18, 0.95)' : 'transparent',
          border: deviceMode === 'android' ? '2px solid var(--border-cyan)' : 'none',
          borderRadius: deviceMode === 'android' ? '28px' : '0',
          boxShadow: deviceMode === 'android' ? '0 0 40px rgba(0, 240, 255, 0.25)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          minHeight: deviceMode === 'android' ? '820px' : 'calc(100vh - 75px)',
          transition: 'all 0.3s ease'
        }}>
          <div className="app-container" style={{ width: '100%' }}>
            {deviceMode === 'windows' && (
              <Sidebar currentMode={currentMode} setMode={setMode} />
            )}

            <main className="main-content">
              <div className="content-body">
                <PlatformSelector currentMode={currentMode} setMode={setMode} />

                {currentMode === 'dashboard' && <DashboardPage health={health} setMode={setMode} />}
                {currentMode === 'sender' && <SenderPage />}
                {currentMode === 'receiver' && <ReceiverPage />}
                {currentMode === 'security_engine' && <SecurityEnginePage />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
