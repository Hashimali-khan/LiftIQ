import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onBypassDemo?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBypassDemo }) => {
  const { signInWithEmail, signUpWithEmail, isConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message);
        }
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your athlete name.');
          setLoading(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Account registered! If confirmation email is enabled, please verify your inbox.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background kinetic ambient glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#f97316]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#94de2d]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1c1b1d] border border-[#2a2a2c] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0e0e10] border border-[#f97316]/40 text-[#f97316] shadow-[0_0_24px_rgba(249,115,22,0.25)] mx-auto">
            <span className="material-symbols-outlined text-3xl font-bold">bolt</span>
          </div>
          <div>
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-widest text-[#f97316] font-bold">
              Kinetic Obsidian
            </span>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4] tracking-tight">
              LiftIQ Athlete Access
            </h1>
            <p className="text-xs text-[#e0c0b1]/70 mt-1">
              AI-assisted biomechanical strength &amp; nutrition tracking.
            </p>
          </div>
        </div>

        {/* Supabase Not Configured Notice */}
        {!isConfigured && (
          <div className="bg-[#241a12] border border-[#f97316]/40 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#f97316] font-bold font-['Space_Grotesk']">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>Supabase Keys Awaiting In .env</span>
            </div>
            <p className="text-[#e0c0b1]/80 text-[11px] leading-relaxed">
              To persist real workouts and use database RLS, update <code className="bg-[#131315] px-1.5 py-0.5 rounded text-[#f97316]">VITE_SUPABASE_URL</code> and <code className="bg-[#131315] px-1.5 py-0.5 rounded text-[#f97316]">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-[#131315] px-1.5 py-0.5 rounded">.env</code>.
            </p>
            {onBypassDemo && (
              <button
                type="button"
                onClick={onBypassDemo}
                className="w-full py-2 bg-[#2a2a2c] hover:bg-[#353437] text-[#e5e1e4] font-['Space_Grotesk'] text-[11px] font-bold rounded-lg border border-[#444] transition-all cursor-pointer"
              >
                Continue in Offline Preview Mode &rarr;
              </button>
            )}
          </div>
        )}

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-[#0e0e10] border border-[#2a2a2c] rounded-xl font-['Space_Grotesk'] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#1c1b1d] text-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.2)] border border-[#f97316]/30'
                : 'text-[#a78b7d] hover:text-[#e5e1e4]'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#1c1b1d] text-[#94de2d] shadow-[0_0_12px_rgba(148,222,45,0.2)] border border-[#94de2d]/30'
                : 'text-[#a78b7d] hover:text-[#e5e1e4]'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-400 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-[#94de2d]/40 rounded-xl text-xs text-[#94de2d] flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#94de2d] mt-0.5">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-wider text-[#a78b7d]">
                Athlete Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-[#0e0e10] border border-[#2a2a2c] focus:border-[#f97316] rounded-xl px-3.5 py-2.5 text-sm text-[#e5e1e4] placeholder-[#555] outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-wider text-[#a78b7d]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@liftiq.io"
              className="w-full bg-[#0e0e10] border border-[#2a2a2c] focus:border-[#f97316] rounded-xl px-3.5 py-2.5 text-sm text-[#e5e1e4] placeholder-[#555] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-wider text-[#a78b7d]">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0e0e10] border border-[#2a2a2c] focus:border-[#f97316] rounded-xl px-3.5 py-2.5 text-sm text-[#e5e1e4] placeholder-[#555] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-full font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-[#f97316] to-[#ff8c42] text-[#131315] hover:opacity-95 shadow-[0_0_24px_rgba(249,115,22,0.3)]'
                : 'bg-gradient-to-r from-[#94de2d] to-[#7ac100] text-[#131315] hover:opacity-95 shadow-[0_0_24px_rgba(148,222,45,0.3)]'
            }`}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#131315] border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <span>Enter Biometric Cockpit</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            ) : (
              <>
                <span>Initialize Athlete Profile</span>
                <span className="material-symbols-outlined text-[16px]">person_add</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-[11px] text-[#a78b7d] font-['Space_Grotesk'] tracking-widest uppercase">
        Protected by Supabase Row-Level Security • Epley PR Engine v2.0
      </div>
    </div>
  );
};

