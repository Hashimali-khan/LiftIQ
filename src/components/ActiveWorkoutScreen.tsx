import React, { useState, useEffect } from 'react';
import { WorkoutSession, WorkoutSet } from '../types';

interface ActiveWorkoutScreenProps {
  session: WorkoutSession;
  onFinish: () => void;
  onBack: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  session,
  onFinish,
  onBack,
}) => {
  // Elapsed timer starting from 38 mins 42 secs (2322 seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(2322);
  const [heartRate, setHeartRate] = useState<number>(148);
  const [showPrBanner, setShowPrBanner] = useState<boolean>(true);

  // Rest timer starting at 84 seconds (01:24)
  const [restSeconds, setRestSeconds] = useState<number>(84);
  const [restTotalDuration, setRestTotalDuration] = useState<number>(90);

  // Exercises state
  const [exercises, setExercises] = useState(session.exercises);
  const [isNextUpExpanded, setIsNextUpExpanded] = useState<boolean>(false);

  // Active set editing values for Set 3
  const [activeSetKg, setActiveSetKg] = useState<string>('87.5');
  const [activeSetReps, setActiveSetReps] = useState<string>('6');
  const [activeSetRir, setActiveSetRir] = useState<string>('1');

  // Elapsed timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Heart rate micro-oscillation (simulating live Bluetooth BLE monitor)
  useEffect(() => {
    const hrInterval = setInterval(() => {
      setHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(172, Math.max(138, prev + delta));
      });
    }, 3000);
    return () => clearInterval(hrInterval);
  }, []);

  // Rest timer countdown
  useEffect(() => {
    const rInterval = setInterval(() => {
      setRestSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(rInterval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAddRestTime = (seconds: number) => {
    setRestSeconds((prev) => prev + seconds);
    setRestTotalDuration((prev) => prev + seconds);
  };

  const handleSkipRest = () => {
    setRestSeconds(0);
  };

  const handleToggleSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((st) => {
            if (st.id !== setId) return st;
            const newDone = !st.isDone;
            if (newDone) {
              // Trigger rest timer
              setRestSeconds(90);
              setRestTotalDuration(90);
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
            }
            return { ...st, isDone: newDone };
          }),
        };
      })
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const newSet: WorkoutSet = {
          id: `set-${Date.now()}`,
          setNumber: newSetNumber,
          prev: lastSet ? `${lastSet.weightKg}×${lastSet.reps}` : '80×10',
          weightKg: lastSet ? lastSet.weightKg : 80,
          reps: lastSet ? lastSet.reps : 8,
          rir: 1,
          isWarmup: false,
          isDone: false,
        };
        return {
          ...ex,
          setsPlanned: ex.setsPlanned + 1,
          sets: [...ex.sets, newSet],
        };
      })
    );
  };

  // Rest timer circle dash calculations
  const radius = 14;
  const circumference = 2 * Math.PI * radius; // ~88
  const strokeDashoffset =
    restTotalDuration > 0
      ? circumference - (restSeconds / restTotalDuration) * circumference
      : circumference;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#131315] text-[#e5e1e4] pb-32">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#131315]/85 backdrop-blur-xl border-b border-[#201f22] shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
        <div className="h-16 px-4 max-w-lg md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-[#e5e1e4] hover:bg-[#201f22] rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
            <img
              alt="Kinetic Obsidian Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9mAGSXM6XxcStCr8x2sOQ9sOGwOvw4TT1OX6Oh-wCWBeK9AER2vpHh-pIWRez-enIb3WHF0KR_X8oOHc2GTzKNh6qYYAnOrLAlaTSXiRUOG9qOOk7M_mvWMBD0GaMfkRQoBpHM73foungg5SDFcS97JMjLzZxihTXwNUX31Ka1v1xBQ9giQTR3f-YbkevrFvWC4eQSly7YJFeIZPBJAK_MLwg6b24FjFmgWN--FENq97tOQK6rN-B"
            />
            <h1 className="font-['Space_Grotesk'] text-lg font-bold tracking-tight uppercase text-[#e5e1e4] truncate">
              Active Workout
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-[#353437]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbd0KDP_KEJI9bh4vtwgom7cUjQt6jNzoLGjkv6UPkH6d2nEv8VdLrkXCWLFpf2T39DdctzEVMmQr18UrsJVTSc0csI3MY7_9jV_8W2iO1uCapEXe6Zgrl8bkvEJPvVZBOwYo3IM2AP2sC-ylfc8sEvPeWOViiumgHMkJIdLDx9VByMLAledy8c2LvrShjPQh1HbEOjw5d87Pf9sEGGs_rTKyZ9G-BfHDDwm01QPFidQLJJDXzOBgw"
            />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex flex-col relative w-full pt-16 px-4 max-w-lg md:max-w-2xl mx-auto space-y-4">
        {/* Floating Sticky Performance HUD */}
        <section className="sticky top-16 z-40 -mx-4 px-4 py-2.5 bg-[#131315]/95 backdrop-blur-xl border-b border-[#201f22] shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            {/* Session Live Metrics */}
            <div className="flex items-center gap-2.5">
              {/* Elapsed Timer with Pulsing Orange Dot */}
              <div className="flex items-center gap-1.5 bg-[#2a2a2c] px-3 py-1 rounded-full shadow-inner border border-[#353437]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f97316] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f97316]" />
                </span>
                <span className="font-['Space_Grotesk'] text-xs font-semibold tracking-wider text-[#e5e1e4] tabular-nums">
                  00:{formatTime(elapsedSeconds)}
                </span>
              </div>

              {/* Dynamic Heart Rate Zone */}
              <div className="flex items-center gap-1 bg-[#2a2a2c] px-3 py-1 rounded-full shadow-inner border border-[#353437]">
                <span
                  className="material-symbols-outlined text-[#f97316] text-[16px] animate-pulse"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  favorite
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#ffb690] font-bold tabular-nums">
                  {heartRate}
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase">
                  bpm
                </span>
              </div>

              {/* Accumulated Volume */}
              <div className="hidden sm:flex items-center gap-1 bg-[#2a2a2c] px-3 py-1 rounded-full border border-[#353437]">
                <span className="material-symbols-outlined text-[#94de2d] text-[16px]">
                  fitness_center
                </span>
                <span className="font-['Space_Grotesk'] text-xs text-[#94de2d] font-bold tabular-nums">
                  8,420
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase">
                  kg
                </span>
              </div>
            </div>

            {/* Finish Workout CTA */}
            <button
              onClick={onFinish}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#f97316] to-[#7ac100] text-[#341100] px-4 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider shadow-[0_0_16px_rgba(249,115,22,0.35)] active:scale-95 transition-transform cursor-pointer"
            >
              <span>Finish</span>
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </button>
          </div>
        </section>

        {/* PR Celebration Notification Banner */}
        {showPrBanner && (
          <aside className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2a2a2c] via-[#201f22] to-[#2a2a2c] p-3 shadow-[0_0_24px_rgba(249,115,22,0.2)] border border-[#f97316]/30">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#f97316]/15 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center text-[#f97316] shadow-inner shrink-0">
                  <span className="material-symbols-outlined text-[20px]">emoji_events</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-[#ffb690] font-bold">
                      New PR Recorded!
                    </span>
                    <span className="bg-[#94de2d]/20 text-[#94de2d] font-['Space_Grotesk'] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      +2.5 kg
                    </span>
                  </div>
                  <p className="text-xs text-[#e0c0b1]/80 truncate">
                    Barbell Incline Bench Press • e1RM{' '}
                    <span className="font-bold text-[#e5e1e4]">102.5 kg</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPrBanner(false)}
                className="w-7 h-7 rounded-full bg-[#353437] flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </aside>
        )}

        {/* Exercise 1 Active Working Module: Barbell Incline Bench Press */}
        {exercises[0] && (
          <article className="relative flex flex-col bg-[#1c1b1d] rounded-2xl p-4 sm:p-5 shadow-xl border border-[#2a2a2c] space-y-3">
            {/* Exercise Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 font-['Space_Grotesk'] text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    {exercises[0].muscleGroup}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">
                    {exercises[0].sets.length} Sets Planned
                  </span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#e5e1e4] mt-1">
                  {exercises[0].name}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="w-8 h-8 rounded-lg bg-[#201f22] flex items-center justify-center text-[#e0c0b1] hover:text-[#e5e1e4] border border-[#353437] cursor-pointer"
                  title="Exercise History"
                >
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-[#201f22] flex items-center justify-center text-[#e0c0b1] hover:text-[#e5e1e4] border border-[#353437] cursor-pointer"
                  title="More Actions"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>
            </div>

            {/* Set Logging Table */}
            <div className="w-full flex flex-col space-y-1.5">
              {/* Headers */}
              <div className="grid grid-cols-12 gap-1 px-2 py-1 text-[#a78b7d] font-['Space_Grotesk'] text-[10px] tracking-wider uppercase items-center text-center">
                <span className="col-span-2 text-left">Set</span>
                <span className="col-span-2">Prev</span>
                <span className="col-span-3">Kg</span>
                <span className="col-span-2">Reps</span>
                <span className="col-span-1">RIR</span>
                <span className="col-span-2 text-right">Done</span>
              </div>

              {/* Set Rows */}
              {exercises[0].sets.map((set, idx) => {
                const isSet3Active = idx === 2;

                if (isSet3Active && !set.isDone) {
                  // Active Set 3 with high-voltage glowing input box
                  return (
                    <div
                      key={set.id}
                      className="relative grid grid-cols-12 gap-1 px-2 py-2 rounded-xl bg-[#2a2a2c] border border-[#f97316] shadow-[0_0_20px_rgba(249,115,22,0.25)] items-center text-center"
                    >
                      <div className="col-span-2 flex items-center gap-1 text-left">
                        <span className="w-5 h-5 rounded-full bg-[#f97316] text-[#552100] font-['Space_Grotesk'] text-[10px] flex items-center justify-center font-bold">
                          {set.setNumber}
                        </span>
                      </div>
                      <span className="col-span-2 text-xs text-[#a78b7d] tabular-nums font-mono">
                        {set.prev}
                      </span>
                      {/* Editable Weight with Active Glow Box */}
                      <div className="col-span-3 bg-[#0e0e10] py-1 px-1 rounded-lg border border-[#f97316]/50 shadow-inner flex items-center justify-center">
                        <input
                          className="w-full bg-transparent text-center font-['Space_Grotesk'] text-sm font-bold text-[#ffb690] focus:outline-none tabular-nums"
                          type="text"
                          value={activeSetKg}
                          onChange={(e) => setActiveSetKg(e.target.value)}
                        />
                      </div>
                      {/* Editable Reps */}
                      <div className="col-span-2 bg-[#0e0e10] py-1 px-1 rounded-lg border border-[#f97316]/50 shadow-inner flex items-center justify-center">
                        <input
                          className="w-full bg-transparent text-center font-['Space_Grotesk'] text-sm font-bold text-[#ffb690] focus:outline-none tabular-nums"
                          type="text"
                          value={activeSetReps}
                          onChange={(e) => setActiveSetReps(e.target.value)}
                        />
                      </div>
                      {/* Editable RIR */}
                      <div className="col-span-1 bg-[#0e0e10] py-1 px-0.5 rounded-lg border border-[#f97316]/50 shadow-inner flex items-center justify-center">
                        <input
                          className="w-full bg-transparent text-center font-['Space_Grotesk'] text-xs font-bold text-[#e5e1e4] focus:outline-none tabular-nums"
                          type="text"
                          value={activeSetRir}
                          onChange={(e) => setActiveSetRir(e.target.value)}
                        />
                      </div>
                      {/* Check Button */}
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => handleToggleSet(exercises[0].id, set.id)}
                          className="w-8 h-8 rounded-lg bg-[#f97316] text-[#552100] flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.6)] active:scale-90 transition-transform cursor-pointer"
                          title="Complete Set"
                        >
                          <span className="material-symbols-outlined text-[18px] font-bold">
                            done
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Standard Completed / Pending row
                const isCompleted = set.isDone;
                return (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-1 px-2 py-1.5 rounded-xl items-center text-center transition-all ${
                      isCompleted
                        ? 'bg-[#201f22]/70 border border-[#353437]'
                        : 'bg-[#201f22]/30 border border-[#201f22] opacity-60'
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-1 text-left">
                      <span className="w-5 h-5 rounded-full bg-[#353437] text-[#e5e1e4] font-['Space_Grotesk'] text-[10px] flex items-center justify-center font-bold">
                        {set.setNumber}
                      </span>
                    </div>
                    <span className="col-span-2 text-xs text-[#a78b7d] tabular-nums font-mono">
                      {set.prev}
                    </span>
                    <div className="col-span-3 bg-[#0e0e10] py-1 px-1.5 rounded text-[#e5e1e4] font-['Space_Grotesk'] text-xs font-semibold tabular-nums">
                      {set.weightKg.toFixed(1)}
                    </div>
                    <div className="col-span-2 bg-[#0e0e10] py-1 px-1.5 rounded text-[#e5e1e4] font-['Space_Grotesk'] text-xs font-semibold tabular-nums">
                      {set.reps}
                    </div>
                    <span className="col-span-1 text-xs text-[#e0c0b1] font-medium">
                      {set.rir}
                    </span>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleToggleSet(exercises[0].id, set.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-[#7ac100] text-[#102000] shadow-[0_0_12px_rgba(148,222,45,0.4)]'
                            : 'bg-[#353437] text-[#a78b7d] hover:text-[#e5e1e4]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] font-bold">
                          check
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Row: Add Set / Replace Exercise */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleAddSet(exercises[0].id)}
                className="flex items-center gap-1 bg-[#201f22] hover:bg-[#2a2a2c] px-3 py-1.5 rounded-lg text-[#ffb690] border border-[#353437] font-['Space_Grotesk'] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Set</span>
              </button>
              <button className="text-[#a78b7d] hover:text-[#e5e1e4] text-xs flex items-center gap-1 py-1 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                <span>Replace Exercise</span>
              </button>
            </div>
          </article>
        )}

        {/* Exercise 2 Queue Preview Card (Next Up: Dumbbell Incline Flyes) */}
        {exercises[1] && (
          <article className="flex flex-col bg-[#1c1b1d] rounded-2xl p-4 shadow-md border border-[#2a2a2c] space-y-2.5">
            <div
              onClick={() => setIsNextUpExpanded(!isNextUpExpanded)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#201f22] border border-[#353437] flex items-center justify-center text-[#a78b7d]">
                  <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#353437] text-[#a78b7d] font-['Space_Grotesk'] text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                      Next Up
                    </span>
                    <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">
                      {exercises[1].setsPlanned} Sets Planned
                    </span>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-sm sm:text-base text-[#e5e1e4] font-semibold">
                    {exercises[1].name}
                  </h3>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-[#201f22] flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4] cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">
                  {isNextUpExpanded ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>

            {/* Exercise Warm-up & Target Form Note */}
            <div className="flex items-center gap-2 bg-[#201f22]/90 border border-[#353437] px-3 py-2 rounded-xl text-[#e0c0b1]">
              <span className="material-symbols-outlined text-[#f97316] text-[18px] shrink-0">
                info
              </span>
              <p className="text-xs">
                Warm-up: 1x12 with 12kg dumbbells. Focus on deep stretch in bottom position.
              </p>
            </div>

            {isNextUpExpanded && (
              <div className="pt-2 space-y-1.5">
                {exercises[1].sets.map((set) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-12 gap-1 px-2 py-1.5 rounded-lg bg-[#201f22]/40 items-center text-center text-xs"
                  >
                    <span className="col-span-2 text-left font-bold text-[#e5e1e4]">
                      Set {set.setNumber}
                    </span>
                    <span className="col-span-3 text-[#a78b7d]">{set.prev}</span>
                    <span className="col-span-3 font-semibold text-[#e5e1e4]">
                      {set.weightKg} kg
                    </span>
                    <span className="col-span-2">{set.reps} reps</span>
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleToggleSet(exercises[1].id, set.id)}
                        className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${
                          set.isDone
                            ? 'bg-[#7ac100] text-[#102000]'
                            : 'bg-[#353437] text-[#a78b7d]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        )}
      </main>

      {/* Sticky Anchored Rest Timer Floating Pill HUD */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between w-full max-w-md bg-[#2a2a2c]/95 backdrop-blur-2xl rounded-full p-1.5 border border-[#353437] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
          {/* Radial Countdown Circle & Text */}
          <div className="flex items-center gap-3 pl-2">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="stroke-[#353437]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r={radius}
                  strokeWidth="3"
                />
                <circle
                  className="stroke-[#94de2d] transition-all duration-300"
                  cx="18"
                  cy="18"
                  fill="none"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <span className="material-symbols-outlined absolute text-[#94de2d] text-[14px] font-bold">
                timer
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-[9px] text-[#a78b7d] uppercase tracking-wider">
                Rest Timer
              </span>
              <span className="font-['Space_Grotesk'] text-base text-[#94de2d] leading-none tabular-nums font-bold">
                {formatTime(restSeconds)}
              </span>
            </div>
          </div>

          {/* Rest Incrementers & Skip Buttons */}
          <div className="flex items-center gap-1.5 pr-1">
            <button
              onClick={() => handleAddRestTime(30)}
              className="bg-[#353437] active:bg-[#39393b] text-[#e5e1e4] px-3 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold tracking-wider cursor-pointer"
            >
              +30s
            </button>
            <button
              onClick={handleSkipRest}
              className="bg-[#201f22] active:bg-[#39393b] text-[#a78b7d] hover:text-[#e5e1e4] px-3 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold tracking-wider cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
