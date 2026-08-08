import { UserProfile } from '../types';

const AUTH_STORAGE_KEY = 'cybershield_auth_user';
const THEME_STORAGE_KEY = 'cybershield_theme_mode';

// Pre-seeded default demonstration profile
const DEFAULT_USER: UserProfile = {
  id: 'USR-8821',
  fullName: 'Dr. Alex Vance',
  email: 'officer@cybershield.ai',
  role: 'Lead Cybersecurity Architect',
  accountStatus: 'ACTIVE_PROTECTED',
  createdAt: '2026-01-15T08:00:00Z',
};

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading stored user session:', e);
    return null;
  }
}

export function setStoredUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export async function loginUser(email: string, _password: string, _rememberMe: boolean): Promise<UserProfile> {
  // Simulate professional API loading delay (400ms)
  await new Promise((r) => setTimeout(r, 400));

  const user: UserProfile = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'CyberShield Officer',
    email: email,
    role: 'Cybersecurity Analyst',
    accountStatus: 'ACTIVE_PROTECTED',
    createdAt: new Date().toISOString(),
  };

  setStoredUser(user);
  return user;
}

export async function registerUser(fullName: string, email: string, _password: string): Promise<UserProfile> {
  await new Promise((r) => setTimeout(r, 500));

  const user: UserProfile = {
    id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    role: 'Security Specialist',
    accountStatus: 'ACTIVE_PROTECTED',
    createdAt: new Date().toISOString(),
  };

  setStoredUser(user);
  return user;
}

export async function sendPasswordReset(email: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 400));
  return Boolean(email);
}

export function logoutUser(): void {
  setStoredUser(null);
}

export { DEFAULT_USER };
