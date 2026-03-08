import { create } from 'zustand';
import { supabase, isSupabaseConfigured, signIn, signUp, signOut } from '../lib/supabase';
import { useAppStore } from './app-store';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isDemo: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  enterDemo: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  isDemo: false,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ loading: false, initialized: true, isDemo: true });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, loading: false, initialized: true });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
      });
    } catch {
      set({ loading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    const { data, error } = await signIn(email, password);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({ user: data.user, loading: false, isDemo: false });
    useAppStore.getState().logEvent('login', `User logged in: ${email}`);
    return true;
  },

  register: async (email, password, fullName) => {
    set({ loading: true, error: null });
    const { data, error } = await signUp(email, password, fullName);
    if (error) {
      set({ loading: false, error: error.message });
      return false;
    }
    set({ user: data.user, loading: false, isDemo: false });
    return true;
  },

  logout: async () => {
    set({ loading: true });
    await signOut();
    set({ user: null, loading: false, isDemo: false });
  },

  enterDemo: () => {
    set({ isDemo: true, loading: false });
    useAppStore.getState().logEvent('login', 'Demo user logged in');
  },

  clearError: () => set({ error: null }),
}));
