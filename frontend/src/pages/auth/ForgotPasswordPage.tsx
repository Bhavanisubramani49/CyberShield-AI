import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthScreen } from '../../types';
import { sendPasswordReset } from '../../services/auth';

interface ForgotPasswordPageProps {
  setAuthScreen: (screen: AuthScreen) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ setAuthScreen }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await sendPasswordReset(email);
    setLoading(false);
    setSubmitted(true);
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.3))',
            border: '1px solid var(--border-green)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <ShieldCheck size={26} color="var(--color-green)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enter your registered security ID or email address
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={28} color="var(--color-green)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Reset Instructions Dispatched
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              A simulated recovery token and reset link have been generated for <strong>{email}</strong>.
            </p>
            <button
              onClick={() => setAuthScreen('login')}
              className="btn btn-primary-green"
              style={{ width: '100%', padding: '11px' }}
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="cyber-label" htmlFor="reset-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-email"
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary-green"
              style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginTop: '6px' }}
            >
              {loading ? 'Sending Recovery Token...' : 'Send Reset Instructions'}
            </button>

            <button
              type="button"
              onClick={() => setAuthScreen('login')}
              className="btn btn-ghost"
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
