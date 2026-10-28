import React, { useState } from 'react';

interface TodayScreenProps {
  onStartWorkout: () => void;
  onNavigateTab: (tab: 'workouts' | 'nutrition' | 'analytics' | 'coach') => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onStartWorkout,
  onNavigateTab,
}) => {
  const [hydrationMl, setHydrationMl] = useState<number>(2400);
  const maxHydration = 3500;
  const [waterBurst, setWaterBurst] = useState(false);

  const handleAddWater = () => {
    setHydrationMl((prev) => Math.min(maxHydration, prev + 250));
    setWaterBurst(true);
    setTimeout(() => setWaterBurst(false), 200);
  };

  const hydrationPercent = Math.min(100, (hydrationMl / maxHydration) * 100);

  return (
    <div className="flex flex-col w-full px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5 pb-28 pt-2">
      {/* Greeting & Readiness Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#1c1b1d] p-4 sm:p-5 shadow-xl border border-[#2a2a2c]">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#f97316]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#a78b7d]">
              Kinetic Sync • 18:42 PM
            </span>
            <div className="flex items-center gap-1.5 bg-[#7ac100]/20 border border-[#94de2d]/30 px-3 py-0.5 rounded-full shadow-[0_0_12px_rgba(148,222,45,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#94de2d] animate-pulse" />
              <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] font-bold tracking-wider">
                94% OPTIMAL READINESS
              </span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4] tracking-tight">
                Good evening, Alex
              </h1>
              <p className="text-sm text-[#e0c0b1]/80 mt-0.5">
                Prime neuromuscular recovery window unlocked.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#2a2a2c] px-3 py-1 rounded-full border border-[#f97316]/40">
              <span
                className="material-symbols-outlined text-[#f97316] text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#f97316]">
                14D STREAK
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Radial Activity Rings HUD (Daily Velocity) */}
      <section className="relative rounded-2xl bg-[#1c1b1d] p-5 shadow-xl border border-[#2a2a2c] overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f97316] text-[20px]">
              donut_large
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
              Daily Velocity
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-[10px] font-bold tracking-wider text-[#4cd7f6] bg-[#353437] px-2.5 py-0.5 rounded-full">
            LIVE BIO-FEED
          </span>
        </div>

        <div className="flex flex-col items-center justify-center my-2 relative">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background tracks */}
              <circle
                className="text-[#353437]"
                cx="50"
                cy="50"
                fill="none"
                opacity="0.35"
                r="42"
                stroke="currentColor"
                strokeWidth="6"
              />
              <circle
                className="text-[#353437]"
                cx="50"
                cy="50"
                fill="none"
                opacity="0.35"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
              />
              <circle
                className="text-[#353437]"
                cx="50"
                cy="50"
                fill="none"
                opacity="0.35"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
              />

              {/* Outer Ring: Workout Load (75%) - Electric Orange */}
              <circle
                className="text-[#f97316]"
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="currentColor"
                strokeDasharray="263.89"
                strokeDashoffset="65.97"
                strokeLinecap="round"
                strokeWidth="6"
                style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.7))' }}
              />

              {/* Mid Ring: Tonnage Volume (90%) - Electric Lime */}
              <circle
                className="text-[#94de2d]"
                cx="50"
                cy="50"
                fill="none"
                r="34"
                stroke="currentColor"
                strokeDasharray="213.63"
                strokeDashoffset="21.36"
                strokeLinecap="round"
                strokeWidth="6"
                style={{ filter: 'drop-shadow(0 0 8px rgba(148,222,45,0.7))' }}
              />

              {/* Inner Ring: Macro Fuel (82%) - Kinetic Cyan */}
              <circle
                className="text-[#4cd7f6]"
                cx="50"
                cy="50"
                fill="none"
                r="26"
                stroke="currentColor"
                strokeDasharray="163.36"
                strokeDashoffset="29.40"
                strokeLinecap="round"
                strokeWidth="6"
                style={{ filter: 'drop-shadow(0 0 8px rgba(76,215,246,0.7))' }}
              />
            </svg>

            {/* Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-widest font-semibold">
                Active Output
              </span>
              <span className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold text-[#e5e1e4] tracking-tight tabular-nums leading-none mt-1">
                2,420
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] text-[#f97316] font-bold tracking-wider mt-1.5 uppercase">
                KCAL BURNED
              </span>
            </div>
          </div>

          {/* Ring Legend */}
          <div className="grid grid-cols-3 w-full gap-2 mt-4 pt-3 bg-[#0e0e10]/80 border border-[#201f22] rounded-xl p-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
                <span className="font-['Space_Grotesk'] text-xs text-[#e0c0b1]/80">Session</span>
              </div>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4] mt-1 tabular-nums">
                75%
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#94de2d] shadow-[0_0_6px_rgba(148,222,45,0.8)]" />
                <span className="font-['Space_Grotesk'] text-xs text-[#e0c0b1]/80">Tonnage</span>
              </div>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#94de2d] mt-1 tabular-nums">
                90%
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] shadow-[0_0_6px_rgba(76,215,246,0.8)]" />
                <span className="font-['Space_Grotesk'] text-xs text-[#e0c0b1]/80">Fueling</span>
              </div>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#4cd7f6] mt-1 tabular-nums">
                82%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Quick Tiles (2x2 Grid) */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-[#1c1b1d] p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-md border border-[#2a2a2c]">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Total Volume
            </span>
            <span className="material-symbols-outlined text-[#94de2d] text-[20px]">
              fitness_center
            </span>
          </div>
          <div className="mt-3">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4] tracking-tight leading-none tabular-nums">
              14.2k
            </div>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] font-bold uppercase tracking-wide mt-1 block">
              KG ACCUMULATED
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1d] p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-md border border-[#2a2a2c]">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Session Time
            </span>
            <span className="material-symbols-outlined text-[#f97316] text-[20px]">
              timer
            </span>
          </div>
          <div className="mt-3">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4] tracking-tight leading-none tabular-nums">
              48<span className="text-lg text-[#e0c0b1]/60 font-normal ml-0.5">m</span>
            </div>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#f97316] font-bold uppercase tracking-wide mt-1 block">
              +6m UNDER TARGET
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1d] p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-md border border-[#2a2a2c]">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Avg Heart Rate
            </span>
            <span className="material-symbols-outlined text-[#ffb4ab] text-[20px] animate-pulse">
              favorite
            </span>
          </div>
          <div className="mt-3">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4] tracking-tight leading-none tabular-nums">
              142
            </div>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#4cd7f6] font-bold uppercase tracking-wide mt-1 block">
              BPM (ZONE 3.8)
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1d] p-3.5 sm:p-4 rounded-xl flex flex-col justify-between shadow-md border border-[#2a2a2c]">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Sets Complete
            </span>
            <span className="material-symbols-outlined text-[#94de2d] text-[20px]">
              checklist
            </span>
          </div>
          <div className="mt-3">
            <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4] tracking-tight leading-none tabular-nums">
              16<span className="text-base text-[#a78b7d] ml-1">/20</span>
            </div>
            <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] font-bold uppercase tracking-wide mt-1 block">
              4 FINISHER SETS REMAIN
            </span>
          </div>
        </div>
      </section>

      {/* Target Protocol (Horizontal Snap Carousel) */}
      <section className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f97316] text-[20px]">
              calendar_today
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
              Target Protocol
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider">
            SWIPE QUEUE (2)
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-1 no-scrollbar">
          {/* Card 1: Active Workout (Push Hypertrophy A) */}
          <div className="snap-center shrink-0 w-80 sm:w-96 rounded-2xl bg-[#1c1b1d] p-4 sm:p-5 shadow-xl border border-[#2a2a2c] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-28 h-28 bg-[#f97316]/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#f97316] bg-[#f97316]/10 border border-[#f97316]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  PRIORITY ALPHA
                </span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#e0c0b1]/80 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-[#94de2d]">
                    schedule
                  </span>
                  55 MIN EST
                </span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4] mt-3">
                Push Hypertrophy A
              </h2>
              <p className="text-xs text-[#e0c0b1]/70 mt-0.5">
                Pectoralis, Anterior Delts, Triceps Lateral
              </p>
              <div className="flex items-center gap-2 mt-3 bg-[#353437]/60 p-2 rounded-lg border border-[#353437]">
                <span className="material-symbols-outlined text-[#ffb690] text-[16px]">
                  layers
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#e5e1e4]">
                  5 Core Exercises
                </span>
                <span className="text-[#a78b7d] text-xs">•</span>
                <span className="font-['Space_Grotesk'] text-xs text-[#e5e1e4]">
                  RPE 8.5 Baseline
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                onClick={onStartWorkout}
                className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#0e0e10] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95 transition-all cursor-pointer min-h-[48px]"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  play_arrow
                </span>
                <span>Start Workout</span>
              </button>
              <button
                onClick={() => onNavigateTab('workouts')}
                className="w-12 h-12 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#e5e1e4] active:bg-[#39393b] border border-[#353437] transition-colors shrink-0 cursor-pointer"
                title="Customize Workout Routine"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </div>

          {/* Card 2: Mobility & Foam Roll */}
          <div className="snap-center shrink-0 w-80 sm:w-96 rounded-2xl bg-[#1c1b1d] p-4 sm:p-5 shadow-xl border border-[#2a2a2c] flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  RECOVERY PROTOCOL
                </span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#e0c0b1]/80 flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">
                    schedule
                  </span>
                  15 MIN
                </span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#e5e1e4] mt-3">
                Mobility &amp; Foam Roll
              </h2>
              <p className="text-xs text-[#e0c0b1]/70 mt-0.5">
                Thoracic Spine Extension, Hip Flexor Release
              </p>
              <div className="flex items-center gap-2 mt-3 bg-[#353437]/60 p-2 rounded-lg border border-[#353437]">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">
                  self_improvement
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#e5e1e4]">
                  3 Decompression Sequences
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => onNavigateTab('workouts')}
                className="w-full py-3 px-5 rounded-full bg-[#2a2a2c] text-[#e5e1e4] border border-[#353437] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#39393b] active:scale-95 transition-all min-h-[48px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                <span>Begin Cool-Down</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Muscle Heatmap (Kinetic Impact Map) */}
      <section className="rounded-2xl bg-[#1c1b1d] p-4 sm:p-5 shadow-xl border border-[#2a2a2c] flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#94de2d] text-[20px]">
              accessibility_new
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
              Kinetic Impact Map
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] bg-[#7ac100]/20 border border-[#94de2d]/30 px-2.5 py-0.5 rounded-full font-bold">
            ACTIVE LOAD
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3 items-center bg-[#0e0e10]/80 p-3.5 rounded-xl border border-[#201f22]">
          {/* Anatomical SVG Diagram */}
          <div className="col-span-5 flex justify-center py-1">
            <svg
              className="w-28 h-40"
              fill="none"
              viewBox="0 0 100 160"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head / Torso baseline silhouette */}
              <circle className="fill-[#2a2a2c]" cx="50" cy="16" r="10" />
              <path
                className="fill-[#2a2a2c]"
                d="M42 30 C30 32 24 45 22 65 L28 66 L34 50 L34 85 L44 85 L44 55 L56 55 L56 85 L66 85 L66 50 L72 66 L78 65 C76 45 70 32 58 30 Z"
              />
              {/* Legs baseline */}
              <path
                className="fill-[#2a2a2c]"
                d="M36 88 L34 140 L44 140 L47 95 L53 95 L56 140 L66 140 L64 88 Z"
              />
              {/* Heatmap Overlays: Chest (High Strain - Neon Orange) */}
              <path
                className="fill-[#f97316]"
                d="M38 34 C44 32 56 32 62 34 C64 42 60 48 50 50 C40 48 36 42 38 34 Z"
                style={{ filter: 'drop-shadow(0 0 6px rgba(249,115,22,0.9))' }}
              />
              {/* Heatmap Overlays: Anterior Shoulders (Moderate/High - Neon Lime) */}
              <circle
                className="fill-[#94de2d]"
                cx="28"
                cy="38"
                r="6"
                style={{ filter: 'drop-shadow(0 0 5px rgba(148,222,45,0.8))' }}
              />
              <circle
                className="fill-[#94de2d]"
                cx="72"
                cy="38"
                r="6"
                style={{ filter: 'drop-shadow(0 0 5px rgba(148,222,45,0.8))' }}
              />
              {/* Heatmap Overlays: Triceps (High - Electric Orange) */}
              <path
                className="fill-[#f97316]"
                d="M22 46 L27 46 L25 58 L20 58 Z"
                style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.8))' }}
              />
              <path
                className="fill-[#f97316]"
                d="M78 46 L73 46 L75 58 L80 58 Z"
                style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.8))' }}
              />
              {/* Core Stabilizers (Low Strain - Tertiary Dim) */}
              <rect
                className="fill-[#4cd7f6]"
                height="18"
                opacity="0.4"
                rx="2"
                width="12"
                x="44"
                y="54"
              />
            </svg>
          </div>

          {/* Recovery Status Matrix */}
          <div className="col-span-7 flex flex-col space-y-2.5 pl-1">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-['Space_Grotesk'] text-[11px] text-[#e5e1e4] uppercase font-semibold">
                  Pectoralis Major
                </span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#f97316] font-bold">
                  92% Strain
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#353437] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full"
                  style={{ width: '92%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-['Space_Grotesk'] text-[11px] text-[#e5e1e4] uppercase font-semibold">
                  Anterior Deltoids
                </span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#94de2d] font-bold">
                  78% Strain
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#353437] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#94de2d] rounded-full"
                  style={{ width: '78%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-['Space_Grotesk'] text-[11px] text-[#e5e1e4] uppercase font-semibold">
                  Triceps Lateral
                </span>
                <span className="font-['Space_Grotesk'] text-[11px] text-[#f97316] font-bold">
                  85% Strain
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#353437] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f97316] rounded-full"
                  style={{ width: '85%' }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-[#94de2d]">
              <span className="material-symbols-outlined text-[16px]">
                check_circle
              </span>
              <span className="font-['Space_Grotesk'] text-[11px] font-semibold">
                Back &amp; Quads fully rested
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hydration Tracker & Macros Fuel Status */}
      <section className="rounded-2xl bg-[#1c1b1d] p-4 sm:p-5 shadow-xl border border-[#2a2a2c] flex flex-col space-y-4">
        {/* Hydration Module */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">
                water_drop
              </span>
              <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                Hydration Tracker
              </span>
            </div>
            <span className="font-['Space_Grotesk'] text-xs text-[#4cd7f6] font-bold tabular-nums">
              {(hydrationMl / 1000).toFixed(1)}L / 3.5L
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 h-3 bg-[#353437] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#00a9c5] to-[#4cd7f6] rounded-full transition-all duration-300"
                style={{ width: `${hydrationPercent}%` }}
              />
            </div>
            <button
              onClick={handleAddWater}
              className={`shrink-0 px-3 py-1.5 rounded-full bg-[#4cd7f6]/20 border border-[#4cd7f6]/30 text-[#4cd7f6] hover:bg-[#4cd7f6]/30 active:scale-95 transition-all flex items-center gap-1 font-['Space_Grotesk'] text-xs font-semibold cursor-pointer ${
                waterBurst ? 'scale-110 shadow-[0_0_12px_rgba(76,215,246,0.6)]' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>250ml</span>
            </button>
          </div>
        </div>

        {/* Macro Fueling Breakdown Bar */}
        <div className="pt-3 bg-[#0e0e10]/70 border border-[#201f22] p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Macros Fuel Status
            </span>
            <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#e5e1e4]">
              195g Protein Target
            </span>
          </div>

          {/* Multi-segment Macro Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5 bg-[#353437]">
            <div className="bg-[#f97316] h-full" style={{ width: '45%' }} title="Protein 45%" />
            <div className="bg-[#94de2d] h-full" style={{ width: '35%' }} title="Carbs 35%" />
            <div className="bg-[#4cd7f6] h-full" style={{ width: '20%' }} title="Fats 20%" />
          </div>

          <div className="flex items-center justify-between mt-3 text-center font-['Space_Grotesk'] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
              <span className="text-[#e0c0b1]">Protein 162g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#94de2d]" />
              <span className="text-[#e0c0b1]">Carbs 210g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
              <span className="text-[#e0c0b1]">Fats 52g</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Motivational Backdrop / Athlete Focus Plate */}
      <section
        onClick={() => onNavigateTab('coach')}
        className="relative rounded-2xl overflow-hidden shadow-xl p-4 sm:p-5 bg-[#1c1b1d] border border-[#2a2a2c] flex items-center justify-between cursor-pointer group hover:border-[#f97316]/50 transition-all"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen transition-opacity group-hover:opacity-40"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuALGh5ln97ynJVSpcS8N9CGUYO8Y9E8WphrJSKOJT9zT9f97DZFIlr0-jlhTYEWri8Jn47cjGeygg1HTKVTeQNPjBlakzw6dfX_hddmFka3LvYOVkHQSEajp-MOUiUoKp2c9usMIafQabwrOtYW9DkHJGu78-cKV76StQmquoLbgx16q__oz_T0YVc0Ce3yI3bg48yI7cCL_RY5SV9cLF1X2LVyMYQgg-JcvKpSJj_xG3B1R6MmQYl8')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1b1d] via-[#1c1b1d]/85 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center pr-3">
          <span className="font-['Space_Grotesk'] text-[10px] text-[#94de2d] font-bold tracking-wider uppercase">
            Coach Obsidian Directive
          </span>
          <h3 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-[#e5e1e4] mt-1">
            Focus on concentric velocity today.
          </h3>
          <p className="text-xs text-[#e0c0b1]/80 mt-0.5">
            Leave 1 RIR on heavy sets for optimal recovery.
          </p>
        </div>
        <div className="relative z-10 w-10 h-10 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#f97316] border border-[#f97316]/30 shadow-[0_0_12px_rgba(249,115,22,0.3)] group-hover:scale-110 transition-transform shrink-0">
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </div>
      </section>
    </div>
  );
};
