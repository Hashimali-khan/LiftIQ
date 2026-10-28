import React from 'react';
import { ScreenTab } from '../types';

interface DesktopDashboardProps {
  onStartWorkout: () => void;
  onNavigateTab: (tab: ScreenTab) => void;
  onToggleMobileView: () => void;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  onStartWorkout,
  onNavigateTab,
  onToggleMobileView,
}) => {
  return (
    <div className="flex w-full min-h-screen bg-[#0e0e10] text-[#e5e1e4] pb-16">
      {/* Desktop Left Sidebar */}
      <aside className="w-64 bg-[#131315] border-r border-[#201f22] flex flex-col justify-between shrink-0 p-5">
        <div className="space-y-6">
          {/* Logo Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center text-[#f97316] font-['Space_Grotesk'] font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)]">
              LQ
            </div>
            <div>
              <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-[#e5e1e4] block">
                LiftIQ
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] tracking-widest uppercase block font-semibold">
                Kinetic Obsidian
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => onNavigateTab('today')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#201f22] text-[#94de2d] border border-[#94de2d]/30 font-['Space_Grotesk'] text-xs font-bold shadow-sm transition-all text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#a78b7d] hover:text-[#e5e1e4] hover:bg-[#1c1b1d] font-['Space_Grotesk'] text-xs font-semibold transition-all text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              <span>Workouts</span>
            </button>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#a78b7d] hover:text-[#e5e1e4] hover:bg-[#1c1b1d] font-['Space_Grotesk'] text-xs font-semibold transition-all text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">monitoring</span>
              <span>Tonnage &amp; Trends</span>
            </button>
            <button
              onClick={() => onNavigateTab('nutrition')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#a78b7d] hover:text-[#e5e1e4] hover:bg-[#1c1b1d] font-['Space_Grotesk'] text-xs font-semibold transition-all text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">nutrition</span>
              <span>Nutrition Fuel</span>
            </button>
            <button
              onClick={() => onNavigateTab('coach')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#a78b7d] hover:text-[#e5e1e4] hover:bg-[#1c1b1d] font-['Space_Grotesk'] text-xs font-semibold transition-all text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              <span>AI Coach Vortex</span>
            </button>
          </nav>
        </div>

        {/* View Mode Toggle at bottom of sidebar */}
        <div className="space-y-3 pt-6 border-t border-[#201f22]">
          <button
            onClick={onToggleMobileView}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1c1b1d] hover:bg-[#201f22] border border-[#353437] text-xs font-['Space_Grotesk'] text-[#4cd7f6] flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">smartphone</span>
            <span>Switch to Mobile App</span>
          </button>
          <div className="text-[10px] text-[#a78b7d] text-center font-['Space_Grotesk']">
            LiftIQ v2.4 Active • High Performance
          </div>
        </div>
      </aside>

      {/* Main Cockpit Stage */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 max-w-7xl">
        {/* Top Desktop Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md px-4 py-2 rounded-xl bg-[#131315] border border-[#201f22] text-[#a78b7d]">
            <span className="material-symbols-outlined text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search telemetry, exercise, nutrition logs..."
              className="bg-transparent border-none outline-none text-xs text-[#e5e1e4] w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#201f22] px-3.5 py-1.5 rounded-full border border-[#f97316]/40">
              <span className="material-symbols-outlined text-[#f97316] text-[18px]">
                local_fire_department
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#f97316]">
                14 Days Streak
              </span>
            </div>

            <div className="flex items-center gap-2">
              <img
                alt="Alex Rivera"
                className="w-9 h-9 rounded-full object-cover border border-[#353437]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbd0KDP_KEJI9bh4vtwgom7cUjQt6jNzoLGjkv6UPkH6d2nEv8VdLrkXCWLFpf2T39DdctzEVMmQr18UrsJVTSc0csI3MY7_9jV_8W2iO1uCapEXe6Zgrl8bkvEJPvVZBOwYo3IM2AP2sC-ylfc8sEvPeWOViiumgHMkJIdLDx9VByMLAledy8c2LvrShjPQh1HbEOjw5d87Pf9sEGGs_rTKyZ9G-BfHDDwm01QPFidQLJJDXzOBgw"
              />
            </div>
          </div>
        </div>

        {/* Live Hero Banner (Athlete Barbell Squat Session) */}
        <section className="relative overflow-hidden rounded-2xl bg-[#1c1b1d] border border-[#2a2a2c] h-64 sm:h-72 p-6 flex flex-col justify-end shadow-2xl">
          <img
            alt="Intense barbell conditioning"
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuALGh5ln97ynJVSpcS8N9CGUYO8Y9E8WphrJSKOJT9zT9f97DZFIlr0-jlhTYEWri8Jn47cjGeygg1HTKVTeQNPjBlakzw6dfX_hddmFka3LvYOVkHQSEajp-MOUiUoKp2c9usMIafQabwrOtYW9DkHJGu78-cKV76StQmquoLbgx16q__oz_T0YVc0Ce3yI3bg48yI7cCL_RY5SV9cLF1X2LVyMYQgg-JcvKpSJj_xG3B1R6MmQYl8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/60 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#f97316] text-[#0e0e10] font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-wider">
                  Live Conditioning
                </span>
                <span className="text-xs text-[#94de2d] font-semibold font-['Space_Grotesk']">
                  Barbell Incline Bench &amp; Squat
                </span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4]">
                78% Completed • 32:15 Active
              </h1>
              {/* Progress bar */}
              <div className="w-72 sm:w-96 h-2 bg-[#353437] rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-[#f97316] to-[#94de2d] rounded-full shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            <button
              onClick={onStartWorkout}
              className="py-3 px-6 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] text-[#0e0e10] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_24px_rgba(249,115,22,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">fitness_center</span>
              <span>Open Workout Logger</span>
            </button>
          </div>
        </section>

        {/* 3-Column Cockpit Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Progress This Week */}
          <div className="bg-[#131315] border border-[#201f22] p-5 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#e5e1e4]">
                Your Progress This Week
              </span>
              <span className="text-xs text-[#94de2d] font-semibold font-['Space_Grotesk']">
                +14.2% Tonnage
              </span>
            </div>

            {/* Weekly Bar Chart */}
            <div className="flex items-end justify-between h-36 mt-4 gap-2 px-1">
              {[
                { day: 'Sun', val: 65, color: '#94de2d' },
                { day: 'Mon', val: 80, color: '#94de2d' },
                { day: 'Tue', val: 40, color: '#f97316' },
                { day: 'Wed', val: 92, color: '#94de2d' },
                { day: 'Thu', val: 85, color: '#94de2d' },
                { day: 'Fri', val: 70, color: '#94de2d' },
                { day: 'Sat', val: 50, color: '#4cd7f6' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full bg-[#1c1b1d] h-28 rounded-lg flex items-end p-1">
                    <div
                      className="w-full rounded-md shadow-sm transition-all"
                      style={{
                        height: `${b.val}%`,
                        backgroundColor: b.color,
                        boxShadow: `0 0 10px ${b.color}50`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#a78b7d] font-['Space_Grotesk']">{b.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hydration Dial Speedometer */}
          <div className="bg-[#131315] border border-[#201f22] p-5 rounded-2xl flex flex-col items-center justify-between shadow-xl">
            <div className="w-full flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#e5e1e4]">
                Hydration Level
              </span>
              <span className="text-xs text-[#4cd7f6] font-semibold font-['Space_Grotesk']">
                2.4L / 3.5L
              </span>
            </div>

            {/* Dial Speedometer SVG */}
            <div className="relative w-44 h-28 flex items-center justify-center my-3">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#2a2a2c"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="url(#dialGrad)"
                  strokeDasharray="125.6"
                  strokeDashoffset="30"
                  strokeLinecap="round"
                  strokeWidth="8"
                  style={{ filter: 'drop-shadow(0 0 6px #94de2d)' }}
                />
                <defs>
                  <linearGradient id="dialGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="70%" stopColor="#94de2d" />
                    <stop offset="100%" stopColor="#4cd7f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-0 text-center">
                <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#e5e1e4] block leading-none">
                  78%
                </span>
                <span className="text-[10px] text-[#a78b7d] uppercase tracking-wider font-['Space_Grotesk']">
                  Completed
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-xs text-[#a78b7d] border-t border-[#201f22] pt-2">
              <span>0% Low</span>
              <span className="text-[#94de2d] font-semibold">Optimal Range</span>
              <span>100% Target</span>
            </div>
          </div>

          {/* Muscle Balance Anatomical Card */}
          <div className="bg-[#131315] border border-[#201f22] p-5 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-['Space_Grotesk'] text-sm font-bold text-[#e5e1e4]">
                Muscle Balance
              </span>
              <span className="material-symbols-outlined text-[#a78b7d] text-[18px]">
                more_horiz
              </span>
            </div>

            <div className="flex items-center justify-around py-3">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span className="text-[#e5e1e4] font-semibold font-['Space_Grotesk']">
                    Chest: 92%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94de2d]" />
                  <span className="text-[#e5e1e4] font-semibold font-['Space_Grotesk']">
                    Delts: 78%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span className="text-[#e5e1e4] font-semibold font-['Space_Grotesk']">
                    Triceps: 85%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6]" />
                  <span className="text-[#a78b7d] font-['Space_Grotesk']">Quads: Rested</span>
                </div>
              </div>

              <div className="w-24 h-32 bg-[#1c1b1d] rounded-xl flex items-center justify-center p-2 border border-[#2a2a2c]">
                <span className="material-symbols-outlined text-4xl text-[#94de2d]">
                  accessibility_new
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#94de2d] border-t border-[#201f22] pt-2 font-['Space_Grotesk']">
              <span>Upper Posterior Rested</span>
              <span>Ready for Pull</span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Today's Workout Sessions list */}
        <section className="bg-[#131315] border border-[#201f22] p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4]">
              Today's Workout Sessions
            </span>
            <button
              onClick={() => onNavigateTab('workouts')}
              className="font-['Space_Grotesk'] text-xs text-[#ffb690] hover:text-[#e5e1e4] font-semibold"
            >
              View Full Schedule →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Morning GYM', duration: '32:15', sets: '6 Completed', icon: 'wb_sunny' },
              { title: 'Mid-Day Mobility', duration: '15:00', sets: '3 Sequences', icon: 'self_improvement' },
              { title: 'Night GYM - Conditioning', duration: '30:15', sets: '6 Scheduled', icon: 'bedtime' },
            ].map((sess, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#1c1b1d] border border-[#2a2a2c] flex items-center justify-between hover:border-[#f97316]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#201f22] flex items-center justify-center text-[#f97316] border border-[#353437]">
                    <span className="material-symbols-outlined text-[20px]">{sess.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#e5e1e4]">
                      {sess.title}
                    </h4>
                    <span className="text-xs text-[#a78b7d] font-['Space_Grotesk']">
                      {sess.sets}
                    </span>
                  </div>
                </div>
                <span className="font-['Space_Grotesk'] text-xs font-bold text-[#94de2d]">
                  {sess.duration}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
