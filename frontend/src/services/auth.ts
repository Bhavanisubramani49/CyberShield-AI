import { UserProfile } from '../types';

const AUTH_STORAGE_KEY = 'cybershield_auth_user';
const THEME_STORAGE_KEY = 'cybershield_theme_mode';

// Pre-seeded default demonstration profile
const DEFAULT_USER: UserProfile = {
  id: 'USER_000010',
  fullName: 'Kavin',
  email: 'kavin@cybershield.local',
  role: 'Lead Cybersecurity Student',
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
  await new Promise((r) => setTimeout(r, 300));

  const cleanInput = email.trim();
  const prefix = cleanInput.split('@')[0].replace('.', ' ');
  const nameFromEmail = prefix.replace(/\b\w/g, l => l.toUpperCase()) || 'CyberShield Officer';

  let userId = cleanInput.split('@')[0];
  let fullName = nameFromEmail;
  let userEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput.toLowerCase()}@cybershield.local`;

  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/conversations/users');
    if (res.ok) {
      const demoUsers = await res.json();
      const matched = demoUsers.find((u: any) => 
        u.user_id?.toLowerCase() === cleanInput.toLowerCase() ||
        u.email?.toLowerCase() === cleanInput.toLowerCase() ||
        u.name?.toLowerCase() === cleanInput.toLowerCase() ||
        u.name?.toLowerCase() === prefix.toLowerCase()
      );
      if (matched) {
        userId = matched.user_id;
        fullName = matched.name;
        userEmail = matched.email || userEmail;
      }
    }
  } catch (e) {
    console.warn('Could not fetch demo users during login:', e);
  }

  const user: UserProfile = {
    id: userId,
    fullName: fullName,
    email: userEmail,
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

export function getActiveUser(): UserProfile {
  return getStoredUser() || DEFAULT_USER;
}

export { DEFAULT_USER };
