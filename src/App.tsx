import React, { useState } from 'react';
import { ScreenTab, WorkoutSession } from './types';
import { INITIAL_WORKOUT_SESSION } from './data/mockData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TodayScreen } from './components/TodayScreen';
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen';
import { NutritionScreen } from './components/NutritionScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { CoachScreen } from './components/CoachScreen';
import { WorkoutsScreen } from './components/WorkoutsScreen';
import { DesktopDashboard } from './components/DesktopDashboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [isActiveWorkoutOpen, setIsActiveWorkoutOpen] = useState<boolean>(false);
  const [isDesktopView, setIsDesktopView] = useState<boolean>(false);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>(INITIAL_WORKOUT_SESSION);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [sessionFinishModal, setSessionFinishModal] = useState<boolean>(false);

  const handleStartWorkout = () => {
    setIsActiveWorkoutOpen(true);
  };

  const handleFinishWorkout = () => {
    setSessionFinishModal(true);
  };

  const confirmFinishWorkout = () => {
    setSessionFinishModal(false);
    setIsActiveWorkoutOpen(false);
    setCurrentTab('analytics');
  };

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
                  14.2k kg volume accumulated. New PR on Incline Bench (102.5kg e1RM)!
                </p>
              </div>

              <div className="bg-[#0e0e10] p-3 rounded-xl border border-[#201f22] grid grid-cols-3 gap-2 text-center font-['Space_Grotesk'] text-xs">
                <div>
                  <span className="text-[#a78b7d] block text-[10px]">TIME</span>
                  <span className="font-bold text-[#e5e1e4]">39m 12s</span>
                </div>
                <div>
                  <span className="text-[#a78b7d] block text-[10px]">TONNAGE</span>
                  <span className="font-bold text-[#94de2d]">8,420 kg</span>
                </div>
                <div>
                  <span className="text-[#a78b7d] block text-[10px]">BURNT</span>
                  <span className="font-bold text-[#f97316]">440 kcal</span>
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
              <img
                alt="Alex Rivera"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#f97316]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbd0KDP_KEJI9bh4vtwgom7cUjQt6jNzoLGjkv6UPkH6d2nEv8VdLrkXCWLFpf2T39DdctzEVMmQr18UrsJVTSc0csI3MY7_9jV_8W2iO1uCapEXe6Zgrl8bkvEJPvVZBOwYo3IM2AP2sC-ylfc8sEvPeWOViiumgHMkJIdLDx9VByMLAledy8c2LvrShjPQh1HbEOjw5d87Pf9sEGGs_rTKyZ9G-BfHDDwm01QPFidQLJJDXzOBgw"
              />
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                  Alex Rivera
                </h3>
                <p className="text-xs text-[#94de2d] font-semibold">
                  Hybrid Conditioning • Tier 1
                </p>
                <p className="text-[11px] text-[#a78b7d]">Member since Sept 2025</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[#0e0e10] p-3 rounded-xl border border-[#201f22] text-xs font-['Space_Grotesk']">
              <div>
                <span className="text-[#a78b7d] text-[10px]">WEIGHT</span>
                <p className="font-bold text-[#e5e1e4]">78.4 kg (-1.8kg)</p>
              </div>
              <div>
                <span className="text-[#a78b7d] text-[10px]">EST. BODY FAT</span>
                <p className="font-bold text-[#94de2d]">14.8%</p>
              </div>
              <div>
                <span className="text-[#a78b7d] text-[10px]">DAILY TARGET</span>
                <p className="font-bold text-[#ffb690]">2,600 kcal</p>
              </div>
              <div>
                <span className="text-[#a78b7d] text-[10px]">PROTEIN GOAL</span>
                <p className="font-bold text-[#4cd7f6]">190g</p>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#201f22] hover:bg-[#2a2a2c] text-[#e5e1e4] font-['Space_Grotesk'] text-xs font-semibold border border-[#353437] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
