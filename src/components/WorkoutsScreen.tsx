import React, { useState } from 'react';

interface WorkoutsScreenProps {
  onStartWorkout: () => void;
}

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({ onStartWorkout }) => {
  const [filterMuscle, setFilterMuscle] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const routines = [
    {
      id: 'r-1',
      title: 'Morning GYM - Push Hypertrophy A',
      focus: 'Chest • Anterior Delts • Triceps',
      duration: '55m',
      exercises: 5,
      rpe: '8.5',
      tonnageEst: '14.2k kg',
      isToday: true,
    },
    {
      id: 'r-2',
      title: 'Pull Hypertrophy B',
      focus: 'Lats • Rhomboids • Biceps',
      duration: '50m',
      exercises: 6,
      rpe: '8.0',
      tonnageEst: '12.8k kg',
      isToday: false,
    },
    {
      id: 'r-3',
      title: 'Lower Kinetic Velocity',
      focus: 'Quads • Hamstrings • Glutes',
      duration: '60m',
      exercises: 5,
      rpe: '9.0',
      tonnageEst: '18.5k kg',
      isToday: false,
    },
    {
      id: 'r-4',
      title: 'Core & Active Recovery',
      focus: 'Abs • Decompression • Mobility',
      duration: '30m',
      exercises: 4,
      rpe: '6.5',
      tonnageEst: '4.2k kg',
      isToday: false,
    },
  ];

  const exercisesLibrary = [
    { name: 'Barbell Incline Bench Press', muscle: 'Chest', equipment: 'Barbell', target: 'Upper Pectoralis' },
    { name: 'Dumbbell Incline Flyes', muscle: 'Chest', equipment: 'Dumbbells', target: 'Sternal Pectoralis' },
    { name: 'High-to-Low Cable Flyes', muscle: 'Chest', equipment: 'Cable', target: 'Lower Costal' },
    { name: 'Overhead Barbell Press', muscle: 'Shoulders', equipment: 'Barbell', target: 'Anterior Deltoids' },
    { name: 'Lateral Cable Raises', muscle: 'Shoulders', equipment: 'Cable', target: 'Lateral Deltoids' },
    { name: 'Barbell Romanian Deadlift', muscle: 'Legs', equipment: 'Barbell', target: 'Hamstrings / Glutes' },
    { name: 'Barbell Back Squat', muscle: 'Legs', equipment: 'Barbell', target: 'Quads / Core' },
    { name: 'Weighted Pull-Ups', muscle: 'Back', equipment: 'Bodyweight + Plates', target: 'Latissimus Dorsi' },
    { name: 'Chest-Supported Row', muscle: 'Back', equipment: 'Machine / Dumbbell', target: 'Mid-Traps / Rhomboids' },
    { name: 'Overhead Rope Tricep Extension', muscle: 'Arms', equipment: 'Cable', target: 'Triceps Long Head' },
    { name: 'Incline Dumbbell Bicep Curl', muscle: 'Arms', equipment: 'Dumbbells', target: 'Biceps Brachii' },
  ];

  const filteredExercises = exercisesLibrary.filter((ex) => {
    const matchesMuscle = filterMuscle === 'All' || ex.muscle === filterMuscle;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5 pb-32 pt-2">
      {/* Active Workout Hero Launcher */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a2a2c] via-[#201f22] to-[#1c1b1d] p-5 shadow-xl border border-[#f97316]/40">
        <div className="absolute right-0 top-0 w-36 h-36 bg-[#f97316]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-wider">
              Today's Session Ready
            </span>
            <span className="font-['Space_Grotesk'] text-xs text-[#94de2d] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#94de2d] animate-pulse" />
              Optimal Recovery
            </span>
          </div>

          <div>
            <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#e5e1e4]">
              Push Hypertrophy A
            </h2>
            <p className="text-xs text-[#e0c0b1]/80 mt-1">
              Chest • Anterior Delts • Triceps Lateral • 5 Exercises Planned
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onStartWorkout}
              className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-[#f97316] to-[#94de2d] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-[#0e0e10] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-95 transition-all cursor-pointer min-h-[48px]"
            >
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              <span>Launch Active Session</span>
            </button>
          </div>
        </div>
      </section>

      {/* Routine Templates */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
            Workout Routines
          </span>
          <span className="font-['Space_Grotesk'] text-xs text-[#a78b7d]">4 Scheduled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className={`p-4 rounded-2xl border transition-all ${
                routine.isToday
                  ? 'bg-[#201f22] border-[#f97316]/50 shadow-md'
                  : 'bg-[#1c1b1d] border-[#2a2a2c] hover:border-[#353437]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4]">
                    {routine.title}
                  </h3>
                  <p className="text-xs text-[#a78b7d] mt-0.5">{routine.focus}</p>
                </div>
                {routine.isToday && (
                  <span className="px-2 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316] text-[10px] font-['Space_Grotesk'] font-bold">
                    Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#2a2a2c] text-xs font-['Space_Grotesk'] text-[#e0c0b1]">
                <span>⏱ {routine.duration}</span>
                <span>🏋️ {routine.exercises} Exercises</span>
                <span>⚡ RPE {routine.rpe}</span>
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={onStartWorkout}
                  className="px-3.5 py-1.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-[#94de2d] border border-[#94de2d]/30 font-['Space_Grotesk'] text-xs font-semibold cursor-pointer"
                >
                  Start Routine
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exercise Library Explorer */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
            Exercise Library
          </span>
          <span className="font-['Space_Grotesk'] text-xs text-[#a78b7d]">
            {filteredExercises.length} Movements
          </span>
        </div>

        {/* Search Well */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1c1b1d] border border-[#2a2a2c]">
          <span className="material-symbols-outlined text-[#a78b7d] text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search exercise by name or target muscle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-[#e5e1e4] placeholder:text-[#a78b7d] outline-none"
          />
        </div>

        {/* Muscle Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'].map((muscle) => (
            <button
              key={muscle}
              onClick={() => setFilterMuscle(muscle)}
              className={`px-3 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                filterMuscle === muscle
                  ? 'bg-[#f97316] text-[#552100] font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'bg-[#201f22] text-[#a78b7d] hover:text-[#e5e1e4] border border-[#2a2a2c]'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>

        {/* Exercises List */}
        <div className="space-y-2">
          {filteredExercises.map((ex, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#1c1b1d] border border-[#2a2a2c] flex items-center justify-between hover:bg-[#201f22] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2a2a2c] border border-[#353437] flex items-center justify-center text-[#ffb690]">
                  <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                </div>
                <div>
                  <h4 className="font-['Space_Grotesk'] text-sm font-semibold text-[#e5e1e4]">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#a78b7d] mt-0.5">
                    <span>{ex.muscle}</span>
                    <span>•</span>
                    <span>{ex.equipment}</span>
                    <span>•</span>
                    <span className="text-[#94de2d]">{ex.target}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onStartWorkout}
                className="w-8 h-8 rounded-lg bg-[#2a2a2c] flex items-center justify-center text-[#a78b7d] hover:text-[#94de2d] border border-[#353437] cursor-pointer"
                title="Add to Active Routine"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
