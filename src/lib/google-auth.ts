import { supabase, isSupabaseConfigured } from './supabase';

// Google OAuth via Supabase Auth
// To enable: In Supabase Dashboard > Authentication > Providers > Google
// Add your Google OAuth Client ID and Secret

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot use Google OAuth.');
    return { error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'openid email profile',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}

// Google Calendar import (requires additional scopes)
export async function signInWithGoogleCalendar() {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { data, error };
}
