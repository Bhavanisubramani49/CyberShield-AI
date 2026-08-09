import React, { useState } from 'react';
import { SenderUser } from './types';
import { SenderAuth } from './pages/auth/SenderAuth';
import { SenderDashboard } from './pages/SenderDashboard';

export const App: React.FC = () => {
  const [user, setUser] = useState<SenderUser | null>(() => {
    const saved = localStorage.getItem('cybershield_sender_user');
    return saved ? JSON.parse(saved) : {
      id: 'SND-01',
      fullName: 'Marcus Reynolds',
      email: 'marcus.reynolds@cyber-lab.org',
      role: 'Authorized Red-Team Security Researcher',
      personaType: 'researcher'
    };
  });

  const handleLogin = (u: SenderUser) => {
    setUser(u);
    localStorage.setItem('cybershield_sender_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cybershield_sender_user');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16' }}>
      {!user ? (
        <SenderAuth onLogin={handleLogin} />
      ) : (
        <SenderDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};
