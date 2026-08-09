import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { AuthScreen, UserProfile } from '../../types';
import { loginUser } from '../../services/auth';

interface LoginPageProps {
  setAuthScreen: (screen: AuthScreen) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setAuthScreen, onLoginSuccess }) => {
  const [email, setEmail] = useState('officer@cybershield.ai');
  const [password, setPassword] = useState('ShieldSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await loginUser(email, password, rememberMe);
      onLoginSuccess(user);
    } catch (err) {
      setError('Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div className="cyber-card-green" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px 32px'
      }}>
        {/* Header with CyberShield Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.3))',
            border: '1px solid var(--border-green)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
          }}>
            <ShieldCheck size={28} color="var(--color-green)" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            CYBERSHIELD <span style={{ color: 'var(--color-green)' }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enter your credentials to access the protection ecosystem
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)',
            fontSize: '0.8rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="cyber-label" htmlFor="login-email">Security ID / Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="cyber-input"
                style={{ paddingLeft: '38px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@cybershield.ai"
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="cyber-label" htmlFor="login-password">Password</label>
              <button
                type="button"
                onClick={() => setAuthScreen('forgot_password')}
                className="btn-ghost"
                style={{ fontSize: '0.72rem', color: 'var(--color-blue-light)', padding: 0, cursor: 'pointer', border: 'none', background: 'none' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="cyber-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--color-green)', width: '15px', height: '15px' }}
              />
              Remember this device
            </label>
            <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
              <CheckCircle size={10} /> 256-Bit SSL
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary-green"
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to CyberShield'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Don't have an analyst account?{' '}
          <button
            onClick={() => setAuthScreen('register')}
            style={{ color: 'var(--color-green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
