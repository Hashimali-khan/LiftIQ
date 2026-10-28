import React, { useState, useEffect, useRef } from 'react';
import { WorkoutSession, WorkoutSet, ExerciseItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  fetchExercisesFromDb,
  startDbWorkoutSession,
  addExerciseToDbSession,
  logWorkoutSetRpc,
  finishDbWorkoutSession,
  DbExercise,
} from '../lib/workoutService';

interface ActiveWorkoutScreenProps {
  session: WorkoutSession;
  onFinish: (stats: { durationMinutes: number; tonnageKg: number; prCount: number }) => void;
  onBack: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  session,
  onFinish,
  onBack,
}) => {
  const { user } = useAuth();
  const [dbSessionId, setDbSessionId] = useState<string>(session.id || crypto.randomUUID());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [heartRate, setHeartRate] = useState<number>(142);
  const [showPrBanner, setShowPrBanner] = useState<boolean>(false);
  const [prBannerText, setPrBannerText] = useState<string>('');
  const [prCount, setPrCount] = useState<number>(0);

  // Rest timer
  const [restSeconds, setRestSeconds] = useState<number>(0);
  const [restTotalDuration, setRestTotalDuration] = useState<number>(90);

  // Exercises state
  const [exercises, setExercises] = useState<ExerciseItem[]>(session.exercises || []);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  // Exercise Picker Modal state
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);
  const [dbExercisesList, setDbExercisesList] = useState<DbExercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [savingSetId, setSavingSetId] = useState<string | null>(null);

  const workoutExerciseIds = useRef<Record<string, string>>({});

  // Initialize DB workout session on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!user) return;
      try {
        const sid = await startDbWorkoutSession(user.id, session.name, session.targetRpe || 8.5);
        if (isMounted) {
          setDbSessionId(sid);
        }

        // Link existing exercises to DB session
        for (let i = 0; i < exercises.length; i++) {
          const ex = exercises[i];
          const weId = await addExerciseToDbSession(
            sid,
            user.id,
            ex.dbExerciseId || crypto.randomUUID(),
            i
          );
          workoutExerciseIds.current[ex.id] = weId;
        }
      } catch (err) {
        console.warn('Could not initialize DB session:', err);
      }
    }

    initSession();

    // Fetch full exercise library from Supabase
    fetchExercisesFromDb().then((data) => {
      if (isMounted) setDbExercisesList(data);
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Elapsed timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Heart rate micro-oscillation (simulating BLE telemetry)
  useEffect(() => {
    const hrInterval = setInterval(() => {
      setHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(172, Math.max(136, prev + delta));
      });
    }, 3000);
    return () => clearInterval(hrInterval);
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (restSeconds <= 0) return;
    const rInterval = setInterval(() => {
      setRestSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(rInterval);
  }, [restSeconds]);

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

  // Update set weight, reps, or rir in state
  const handleUpdateSetValue = (
    exerciseId: string,
    setId: string,
    field: 'weightKg' | 'reps' | 'rir',
    value: number
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((st) => (st.id === setId ? { ...st, [field]: value } : st)),
        };
      })
    );
  };

  // Complete / Toggle set with Supabase RPC Epley PR engine
  const handleToggleSet = async (exerciseId: string, setItem: WorkoutSet) => {
    const newDoneState = !setItem.isDone;

    // Optimistically update UI
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((st) => (st.id === setItem.id ? { ...st, isDone: newDoneState } : st)),
        };
      })
    );

    if (newDoneState) {
      // Trigger rest timer
      setRestSeconds(90);
      setRestTotalDuration(90);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // If user is authenticated, save via Supabase RPC
      if (user) {
        setSavingSetId(setItem.id);
        const weId = workoutExerciseIds.current[exerciseId] || crypto.randomUUID();

        const result = await logWorkoutSetRpc({
          setId: setItem.id.includes('-') && setItem.id.length === 36 ? setItem.id : crypto.randomUUID(),
          workoutExerciseId: weId,
          userId: user.id,
          setNumber: setItem.setNumber,
          weightKg: setItem.weightKg,
          reps: setItem.reps,
          rir: setItem.rir,
          isWarmup: setItem.isWarmup,
        });

        setSavingSetId(null);

        if (result && (result.is_pr_weight || result.is_pr_e1rm)) {
          setPrCount((prev) => prev + 1);
          const currentEx = exercises.find((e) => e.id === exerciseId);
          setPrBannerText(
            `New PR on ${currentEx?.name || 'Exercise'}! ${setItem.weightKg}kg for ${setItem.reps} reps (e1RM: ${result.e1rm}kg)`
          );
          setShowPrBanner(true);

          setExercises((prev) =>
            prev.map((ex) => {
              if (ex.id !== exerciseId) return ex;
              return {
                ...ex,
                sets: ex.sets.map((st) =>
                  st.id === setItem.id
                    ? {
                        ...st,
                        isPr: true,
                        isPrWeight: result.is_pr_weight,
                        isPrE1rm: result.is_pr_e1rm,
                        e1rm: result.e1rm,
                      }
                    : st
                ),
              };
            })
          );
        }
      }
    }
  };

  // Add new set to an exercise
  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const newSet: WorkoutSet = {
          id: crypto.randomUUID(),
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

  // Add an exercise from Supabase to the active workout
  const handleSelectDbExercise = async (dbEx: DbExercise) => {
    const newExId = crypto.randomUUID();
    const newExerciseItem: ExerciseItem = {
      id: newExId,
      dbExerciseId: dbEx.id,
      name: dbEx.name,
      muscleGroup: dbEx.muscle_group,
      setsPlanned: 3,
      historyNote: dbEx.description || undefined,
      sets: [
        {
          id: crypto.randomUUID(),
          setNumber: 1,
          prev: '—',
          weightKg: 60,
          reps: 10,
          rir: 2,
          isWarmup: false,
          isDone: false,
        },
        {
          id: crypto.randomUUID(),
          setNumber: 2,
          prev: '—',
          weightKg: 65,
          reps: 8,
          rir: 1,
          isWarmup: false,
          isDone: false,
        },
        {
          id: crypto.randomUUID(),
          setNumber: 3,
          prev: '—',
          weightKg: 70,
          reps: 6,
          rir: 1,
          isWarmup: false,
          isDone: false,
        },
      ],
    };

    setExercises((prev) => [...prev, newExerciseItem]);
    setActiveExerciseIndex(exercises.length);
    setIsExercisePickerOpen(false);

    if (user) {
      const weId = await addExerciseToDbSession(dbSessionId, user.id, dbEx.id, exercises.length);
      workoutExerciseIds.current[newExId] = weId;
    }
  };

  // Complete workout and calculate real stats
  const handleCompleteSession = async () => {
    let totalTonnage = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach((st) => {
        if (st.isDone) {
          totalTonnage += st.weightKg * st.reps;
        }
      });
    });

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (user) {
      await finishDbWorkoutSession(
        dbSessionId,
        user.id,
        durationMinutes,
        Math.round(totalTonnage),
        `Completed with ${exercises.length} exercises. PRs: ${prCount}`
      );
    }

    onFinish({
      durationMinutes,
      tonnageKg: Math.round(totalTonnage),
      prCount,
    });
  };

  // Rest timer progress circle calculation
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    restTotalDuration > 0
      ? circumference - (restSeconds / restTotalDuration) * circumference
      : circumference;

  const currentExercise = exercises[activeExerciseIndex] || exercises[0];

  const filteredDbExercises = dbExercisesList.filter((e) => {
    const matchesM = selectedMuscle === 'All' || e.muscle_group.toLowerCase() === selectedMuscle.toLowerCase();
    const matchesS =
      e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      (e.target_muscle && e.target_muscle.toLowerCase().includes(exerciseSearch.toLowerCase()));
    return matchesM && matchesS;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#131315] text-[#e5e1e4] pb-32">
      {/* Top Fixed Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-[#131315]/85 backdrop-blur-xl border-b border-[#201f22] shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
        <div className="h-16 px-4 max-w-lg md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-[#e5e1e4] hover:bg-[#201f22] rounded-full transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#f97316] uppercase font-bold tracking-wider">
                Live Session
              </span>
              <h1 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold tracking-tight uppercase text-[#e5e1e4] truncate">
                {session.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Finish Workout Trigger */}
            <button
              onClick={handleCompleteSession}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#0e0e10] shadow-[0_0_12px_rgba(249,115,22,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              Finish
            </button>
          </div>
        </div>
      </header>

      {/* Main Active Workout View */}
      <main className="flex-1 w-full px-4 max-w-lg md:max-w-2xl mx-auto space-y-4 pt-20">
        {/* Dynamic Telemetry HUD */}
        <section className="bg-[#1c1b1d] rounded-2xl p-3 sm:p-4 border border-[#2a2a2c] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#201f22] border border-[#353437] flex items-center justify-center text-[#f97316]">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </div>
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] text-[#a78b7d] uppercase tracking-wider block">
                Elapsed
              </span>
              <span className="text-base sm:text-lg font-['Space_Grotesk'] font-bold text-[#e5e1e4] tabular-nums">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#201f22] border border-[#353437] flex items-center justify-center text-rose-500">
              <span className="material-symbols-outlined text-[20px]">favorite</span>
            </div>
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] text-[#a78b7d] uppercase tracking-wider block">
                Heart Rate
              </span>
              <span className="text-base sm:text-lg font-['Space_Grotesk'] font-bold text-[#e5e1e4] tabular-nums flex items-center gap-1">
                {heartRate} <span className="text-[10px] text-[#a78b7d]">BPM</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#201f22] border border-[#353437] flex items-center justify-center text-[#94de2d]">
              <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            </div>
            <div>
              <span className="text-[10px] font-['Space_Grotesk'] text-[#a78b7d] uppercase tracking-wider block">
                PRs Hit
              </span>
              <span className="text-base sm:text-lg font-['Space_Grotesk'] font-bold text-[#94de2d] tabular-nums">
                {prCount}
              </span>
            </div>
          </div>
        </section>

        {/* Dynamic PR Celebration Banner */}
        {showPrBanner && (
          <aside className="relative flex items-center justify-between gap-3 bg-gradient-to-r from-[#321703] via-[#241305] to-[#1c1b1d] border border-[#f97316]/60 rounded-2xl p-4 shadow-[0_0_24px_rgba(249,115,22,0.3)] animate-bounce-short">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316] flex items-center justify-center text-[#f97316] shrink-0">
                <span className="material-symbols-outlined text-[22px]">celebration</span>
              </div>
              <div>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-wider text-[#f97316]">
                  Personal Record Verified
                </span>
                <p className="font-['Space_Grotesk'] text-xs font-semibold text-[#e5e1e4] mt-0.5">
                  {prBannerText}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPrBanner(false)}
              className="w-7 h-7 rounded-full bg-[#353437] flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4] cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </aside>
        )}

        {/* Exercise Switcher Carousel Tabs */}
        <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {exercises.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`py-2 px-3.5 rounded-xl font-['Space_Grotesk'] text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                idx === activeExerciseIndex
                  ? 'bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/60 font-bold shadow-[0_0_12px_rgba(249,115,22,0.2)]'
                  : 'bg-[#1c1b1d] text-[#a78b7d] hover:text-[#e5e1e4] border border-[#2a2a2c]'
              }`}
            >
              <span>{idx + 1}.</span>
              <span className="truncate max-w-[130px]">{ex.name}</span>
              {ex.sets.some((s) => s.isDone) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#94de2d]" />
              )}
            </button>
          ))}

          {/* Add Exercise to Routine Button */}
          <button
            onClick={() => setIsExercisePickerOpen(true)}
            className="py-2 px-3 rounded-xl bg-[#201f22] hover:bg-[#2a2a2c] text-[#94de2d] border border-[#94de2d]/40 font-['Space_Grotesk'] text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Exercise</span>
          </button>
        </section>

        {/* Active Exercise Detail Card */}
        {currentExercise && (
          <article className="flex flex-col bg-[#1c1b1d] rounded-2xl p-4 sm:p-5 shadow-xl border border-[#2a2a2c] space-y-4">
            {/* Exercise Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 font-['Space_Grotesk'] text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    {currentExercise.muscleGroup}
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">
                    {currentExercise.sets.filter((s) => s.isDone).length} of{' '}
                    {currentExercise.sets.length} Sets Logged
                  </span>
                </div>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#e5e1e4] mt-1">
                  {currentExercise.name}
                </h2>
              </div>
            </div>

            {/* Set Table */}
            <div className="w-full flex flex-col space-y-2">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-1.5 px-2 py-1 text-[#a78b7d] font-['Space_Grotesk'] text-[10px] tracking-wider uppercase items-center text-center">
                <span className="col-span-2 text-left">Set</span>
                <span className="col-span-2">Prev</span>
                <span className="col-span-3">Weight (Kg)</span>
                <span className="col-span-2">Reps</span>
                <span className="col-span-1">RIR</span>
                <span className="col-span-2 text-right">Log</span>
              </div>

              {/* Set Rows */}
              {currentExercise.sets.map((setItem) => {
                const isCompleted = setItem.isDone;
                const isSaving = savingSetId === setItem.id;

                return (
                  <div
                    key={setItem.id}
                    className={`grid grid-cols-12 gap-1.5 px-2.5 py-2 rounded-xl items-center text-center transition-all ${
                      isCompleted
                        ? 'bg-[#201f22]/90 border border-[#94de2d]/30 shadow-[0_0_8px_rgba(148,222,45,0.1)]'
                        : 'bg-[#201f22]/40 border border-[#2a2a2c] hover:border-[#353437]'
                    }`}
                  >
                    {/* Set Number & PR Badge */}
                    <div className="col-span-2 flex items-center gap-1.5 text-left">
                      <span
                        className={`w-5 h-5 rounded-full font-['Space_Grotesk'] text-[10px] flex items-center justify-center font-bold ${
                          isCompleted
                            ? 'bg-[#94de2d] text-[#131315]'
                            : 'bg-[#353437] text-[#e5e1e4]'
                        }`}
                      >
                        {setItem.setNumber}
                      </span>
                      {setItem.isPr && (
                        <span
                          className="material-symbols-outlined text-[#f97316] text-[14px]"
                          title="Personal Record Set"
                        >
                          star
                        </span>
                      )}
                    </div>

                    {/* Previous Set Performance */}
                    <span className="col-span-2 text-xs text-[#a78b7d] tabular-nums font-mono">
                      {setItem.prev || '—'}
                    </span>

                    {/* Editable Weight Input */}
                    <div className="col-span-3 bg-[#0e0e10] py-1 px-1.5 rounded-lg border border-[#2a2a2c] focus-within:border-[#f97316] flex items-center justify-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={setItem.weightKg}
                        onChange={(e) =>
                          handleUpdateSetValue(
                            currentExercise.id,
                            setItem.id,
                            'weightKg',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-transparent text-center font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-[#e5e1e4] focus:outline-none tabular-nums"
                      />
                    </div>

                    {/* Editable Reps Input */}
                    <div className="col-span-2 bg-[#0e0e10] py-1 px-1 rounded-lg border border-[#2a2a2c] focus-within:border-[#f97316] flex items-center justify-center">
                      <input
                        type="number"
                        min="1"
                        value={setItem.reps}
                        onChange={(e) =>
                          handleUpdateSetValue(
                            currentExercise.id,
                            setItem.id,
                            'reps',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full bg-transparent text-center font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-[#e5e1e4] focus:outline-none tabular-nums"
                      />
                    </div>

                    {/* Editable RIR */}
                    <div className="col-span-1 bg-[#0e0e10] py-1 px-0.5 rounded-lg border border-[#2a2a2c] focus-within:border-[#f97316] flex items-center justify-center">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={setItem.rir}
                        onChange={(e) =>
                          handleUpdateSetValue(
                            currentExercise.id,
                            setItem.id,
                            'rir',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full bg-transparent text-center font-['Space_Grotesk'] text-xs font-bold text-[#ffb690] focus:outline-none tabular-nums"
                      />
                    </div>

                    {/* Check / Complete Button */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleToggleSet(currentExercise.id, setItem)}
                        disabled={isSaving}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-[#94de2d] text-[#131315] shadow-[0_0_12px_rgba(148,222,45,0.4)]'
                            : 'bg-[#353437] text-[#a78b7d] hover:text-[#e5e1e4] hover:bg-[#444]'
                        }`}
                      >
                        {isSaving ? (
                          <span className="w-3.5 h-3.5 border-2 border-[#131315] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[18px] font-bold">
                            check
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Set Table Action Row */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleAddSet(currentExercise.id)}
                className="flex items-center gap-1 bg-[#201f22] hover:bg-[#2a2a2c] px-3.5 py-2 rounded-xl text-[#ffb690] border border-[#353437] font-['Space_Grotesk'] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Set</span>
              </button>

              <button
                onClick={() => setIsExercisePickerOpen(true)}
                className="text-[#a78b7d] hover:text-[#e5e1e4] text-xs flex items-center gap-1 py-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">library_add</span>
                <span>Select Another Exercise</span>
              </button>
            </div>
          </article>
        )}
      </main>

      {/* Floating Rest Timer HUD */}
      {restSeconds > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between w-full max-w-md bg-[#2a2a2c]/95 backdrop-blur-2xl rounded-full p-2 border border-[#353437] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
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
                  Rest Countdown
                </span>
                <span className="font-['Space_Grotesk'] text-base text-[#94de2d] leading-none tabular-nums font-bold">
                  {formatTime(restSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pr-1">
              <button
                onClick={() => handleAddRestTime(30)}
                className="bg-[#353437] active:bg-[#444] text-[#e5e1e4] px-3 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold cursor-pointer"
              >
                +30s
              </button>
              <button
                onClick={handleSkipRest}
                className="bg-[#201f22] active:bg-[#333] text-[#a78b7d] hover:text-[#e5e1e4] px-3 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold cursor-pointer"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Exercise Library Picker Modal */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#1c1b1d] border border-[#2a2a2c] rounded-3xl p-5 max-w-lg w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-['Space_Grotesk'] text-[10px] text-[#f97316] uppercase font-bold tracking-wider">
                  Supabase Exercise Library
                </span>
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                  Add Exercise to Workout
                </h3>
              </div>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#201f22] flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Search and Muscle Filter */}
            <div className="space-y-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#a78b7d] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search exercise or target muscle..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-[#0e0e10] border border-[#2a2a2c] focus:border-[#f97316] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#e5e1e4] placeholder-[#555] outline-none"
                />
              </div>

              {/* Muscle Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-2.5 py-1 rounded-lg font-['Space_Grotesk'] text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                      selectedMuscle === m
                        ? 'bg-[#f97316] text-[#131315] font-bold'
                        : 'bg-[#201f22] text-[#a78b7d] hover:text-[#e5e1e4]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[50vh]">
              {filteredDbExercises.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#a78b7d]">
                  No matching exercises found in library.
                </div>
              ) : (
                filteredDbExercises.map((dbEx) => (
                  <button
                    key={dbEx.id}
                    onClick={() => handleSelectDbExercise(dbEx)}
                    className="w-full p-3 rounded-xl bg-[#201f22]/70 hover:bg-[#2a2a2c] border border-[#2a2a2c] hover:border-[#f97316]/50 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Space_Grotesk'] text-[9px] uppercase font-bold text-[#f97316]">
                          {dbEx.muscle_group}
                        </span>
                        <span className="text-[10px] text-[#a78b7d]">• {dbEx.equipment}</span>
                      </div>
                      <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-semibold text-[#e5e1e4] group-hover:text-[#ffb690]">
                        {dbEx.name}
                      </span>
                      {dbEx.target_muscle && (
                        <span className="text-[10px] text-[#a78b7d]">
                          Target: {dbEx.target_muscle}
                        </span>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[#a78b7d] group-hover:text-[#94de2d] text-[20px]">
                      add_circle
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
