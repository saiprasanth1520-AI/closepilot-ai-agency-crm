import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';
import { isSupabaseConfigured } from '../lib/supabase';
import { signInWithGoogle } from '../lib/google-auth';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { login, register, enterDemo, loading, error, clearError } = useAuthStore();

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(email, password, fullName);
    }
  };

  const switchMode = () => {
    clearError();
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-3xl font-bold tracking-tight">Lumina</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            The CRM built for <span className="gradient-text">modern agencies</span>
          </h2>
          <p className="text-textSecondary text-lg leading-relaxed">
            Manage your pipeline, track campaigns, and close deals faster with intelligent automation.
          </p>
          <div className="mt-10 space-y-4">
            <Feature text="Visual drag-and-drop pipeline" />
            <Feature text="Smart Actions automate your workflow" />
            <Feature text="Campaign analytics and ad spend tracking" />
            <Feature text="Creative asset management" />
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Lumina</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-textSecondary mb-8">
            {mode === 'login'
              ? 'Sign in to access your agency dashboard.'
              : 'Get started with Lumina in seconds.'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
              <AlertCircle size={18} className="text-error shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {!configured && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl">
              <p className="text-sm text-warning">
                Supabase is not configured. Add <code className="bg-surface px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-surface px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your <code className="bg-surface px-1 rounded">.env</code> file, or use Demo Mode below.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={configured}
                className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={configured}
                minLength={6}
                className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {configured && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </form>

          {/* Google OAuth */}
          {configured && (
            <>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-textSecondary">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <button
                onClick={() => signInWithGoogle()}
                className="w-full mt-4 py-3 bg-surface hover:bg-surface/80 border border-border text-text rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Demo mode button */}
          <button
            onClick={enterDemo}
            className="w-full mt-4 py-3 bg-surface hover:bg-surface/80 border border-border text-text rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} />
            {configured ? 'Continue with Demo Data' : 'Enter Demo Mode'}
          </button>

          <p className="text-center text-sm text-textSecondary mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="text-primary hover:underline font-medium">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 rounded-full bg-primary" />
    <span className="text-textSecondary">{text}</span>
  </div>
);
