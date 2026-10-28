import React, { useState } from 'react';
import { ScreenTab, WorkoutSession } from './types';
import { INITIAL_WORKOUT_SESSION } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TodayScreen } from './components/TodayScreen';
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen';
import { NutritionScreen } from './components/NutritionScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { CoachScreen } from './components/CoachScreen';
import { WorkoutsScreen } from './components/WorkoutsScreen';
import { DesktopDashboard } from './components/DesktopDashboard';

function MainApp() {
  const { user, profile, loading, signOut, isConfigured } = useAuth();
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [isActiveWorkoutOpen, setIsActiveWorkoutOpen] = useState<boolean>(false);
  const [isDesktopView, setIsDesktopView] = useState<boolean>(false);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>(INITIAL_WORKOUT_SESSION);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [sessionFinishModal, setSessionFinishModal] = useState<boolean>(false);
  const [bypassDemo, setBypassDemo] = useState<boolean>(false);
  const [lastWorkoutStats, setLastWorkoutStats] = useState<{
    durationMinutes: number;
    tonnageKg: number;
    prCount: number;
  }>({
    durationMinutes: 42,
    tonnageKg: 8420,
    prCount: 1,
  });

  const handleStartWorkout = () => {
    setIsActiveWorkoutOpen(true);
  };

  const handleFinishWorkout = (stats: {
    durationMinutes: number;
    tonnageKg: number;
    prCount: number;
  }) => {
    setLastWorkoutStats(stats);
    setSessionFinishModal(true);
  };

  const confirmFinishWorkout = () => {
    setSessionFinishModal(false);
    setIsActiveWorkoutOpen(false);
    setCurrentTab('analytics');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#131315] flex flex-col items-center justify-center space-y-4 text-[#e5e1e4]">
        <div className="w-10 h-10 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
        <span className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-[#a78b7d]">
          Synchronizing Athlete Telemetry...
        </span>
      </div>
    );
  }

  // If user is not authenticated and has not chosen to bypass, show AuthScreen
  if (!user && !bypassDemo) {
    return <AuthScreen onBypassDemo={() => setBypassDemo(true)} />;
  }

  // If active workout mode is open, show the full-screen Active Workout module
  if (isActiveWorkoutOpen) {
    return (
      <div className="min-h-screen bg-[#131315]">
        <ActiveWorkoutScreen
          session={workoutSession}
          onBack={() => setIsActiveWorkoutOpen(false)}
          onFinish={handleFinishWorkout}
        />

        {/* Workout Complete Celebration Modal */}
        {sessionFinishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="bg-[#1c1b1d] border border-[#f97316]/50 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-[0_0_32px_rgba(249,115,22,0.3)] text-center">
              <div className="w-14 h-14 rounded-full bg-[#94de2d]/20 border border-[#94de2d]/40 mx-auto flex items-center justify-center text-[#94de2d]">
                <span className="material-symbols-outlined text-3xl">emoji_events</span>
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4]">
                  Session Recorded!
                </h3>
                <p className="text-xs text-[#e0c0b1]/80 mt-1">
                  {lastWorkoutStats.tonnageKg.toLocaleString()} kg volume accumulated. {lastWorkoutStats.prCount > 0 ? `${lastWorkoutStats.prCount} new Personal Record verified!` : 'Session committed to Supabase.'}
                </p>
              </div>

              <div className="bg-[#0e0e10] p-3 rounded-xl border border-[#201f22] grid grid-cols-3 gap-2 text-center font-['Space_Grotesk'] text-xs">
                <div>
                  <span className="text-[#a78b7d] block text-[10px]">TIME</span>
                  <span className="font-bold text-[#e5e1e4]">{lastWorkoutStats.durationMinutes}m</span>
                </div>
                <div>
                  <span className="text-[#a78b7d] block text-[10px]">TONNAGE</span>
                  <span className="font-bold text-[#94de2d]">{lastWorkoutStats.tonnageKg.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[#a78b7d] block text-[10px]">BURNT</span>
                  <span className="font-bold text-[#f97316]">{Math.round(lastWorkoutStats.durationMinutes * 9.5)} kcal</span>
                </div>
              </div>

              <button
                onClick={confirmFinishWorkout}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#341100] shadow-lg cursor-pointer"
              >
                Sync with Kinetics
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If Desktop Cockpit mode is active
  if (isDesktopView) {
    return (
      <div className="min-h-screen bg-[#0e0e10]">
        <DesktopDashboard
          onStartWorkout={handleStartWorkout}
          onNavigateTab={(tab) => {
            setCurrentTab(tab);
            setIsDesktopView(false);
          }}
          onToggleMobileView={() => setIsDesktopView(false)}
        />
      </div>
    );
  }

  const athleteName = profile?.name || (user?.email ? user.email.split('@')[0] : 'Alex Rivera');

  return (
    <div className="min-h-screen bg-[#131315] text-[#e5e1e4] flex flex-col antialiased">
      {/* Fixed Sticky Header */}
      <Header
        currentTab={currentTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isDesktopView={isDesktopView}
        onToggleDesktopView={() => setIsDesktopView(!isDesktopView)}
      />

      {/* Main Tab Screen Content */}
      <main className="flex-1 pt-16">
        {currentTab === 'today' && (
          <TodayScreen
            onStartWorkout={handleStartWorkout}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutsScreen onStartWorkout={handleStartWorkout} />
        )}

        {currentTab === 'nutrition' && <NutritionScreen />}

        {currentTab === 'analytics' && <AnalyticsScreen />}

        {currentTab === 'coach' && <CoachScreen />}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <Navigation currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Athlete Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1b1d] border border-[#2a2a2c] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-[#f97316] font-bold">
                Athlete Telemetry
              </span>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#201f22] flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#0e0e10] border-2 border-[#f97316] flex items-center justify-center text-xl font-bold font-['Space_Grotesk'] text-[#f97316]">
                {athleteName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                  {athleteName}
                </h3>
                <p className="text-xs text-[#94de2d] font-semibold">
                  {user?.email || 'Demo Mode Athlete'}
                </p>
                <p className="text-[11px] text-[#a78b7d]">
                  {isConfigured ? '🟢 Connected to Supabase' : '🟡 Offline Demo Mode'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#0e0e10] p-3 rounded-xl border border-[#201f22] text-xs font-['Space_Grotesk']">
              <div>
                <span className="text-[#a78b7d] text-[10px]">WEIGHT</span>
                <p className="font-bold text-[#e5e1e4]">
                  {profile?.goal_weight_kg ? `${profile.goal_weight_kg} kg` : '78.4 kg'}
                </p>
              </div>
              <div>
                <span className="text-[#a78b7d] text-[10px]">UNIT PREF</span>
                <p className="font-bold text-[#94de2d]">
                  {profile?.unit_pref?.toUpperCase() || 'KG'}
                </p>
              </div>
              <div>
                <span className="text-[#a78b7d] text-[10px]">DAILY TARGET</span>
                <p className="font-bold text-[#ffb690]">
                  {profile?.calorie_target || 2600} kcal
                </p>
              </div>
              <div>
                <span className="text-[#a78b7d] text-[10px]">PROTEIN GOAL</span>
                <p className="font-bold text-[#4cd7f6]">
                  {profile?.protein_target_g || 190}g
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  setIsProfileModalOpen(false);
                }}
                className="w-full py-2.5 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-300 font-['Space_Grotesk'] text-xs font-semibold border border-red-800/40 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setBypassDemo(false);
                  setIsProfileModalOpen(false);
                }}
                className="w-full py-2.5 rounded-full bg-[#f97316] hover:bg-[#ff8c42] text-[#131315] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Go to Sign In</span>
              </button>
            )}

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2 rounded-full bg-[#201f22] hover:bg-[#2a2a2c] text-[#a78b7d] font-['Space_Grotesk'] text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
