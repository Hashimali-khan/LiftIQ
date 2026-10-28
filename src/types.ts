export type ScreenTab = 'today' | 'workouts' | 'nutrition' | 'analytics' | 'coach';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  prev: string;
  weightKg: number;
  reps: number;
  rir: number;
  isWarmup: boolean;
  isDone: boolean;
  isPr?: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: string;
  setsPlanned: number;
  historyNote?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  subtitle: string;
  durationMinutes: number;
  targetRpe: number;
  exercisesCount: number;
  isPriorityAlpha?: boolean;
  exercises: ExerciseItem[];
}

export interface MealItem {
  id: string;
  name: string;
  weightG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface MealGroup {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  time: string;
  description: string;
  calories: number;
  proteinG: number;
  isExpanded?: boolean;
  isRecent?: boolean;
  items: MealItem[];
}

export interface WeightRecord {
  date: string;
  dayLabel: string;
  dayNumber: string;
  weightKg: number;
  deltaKg: number;
  rollingAvg7dKg: number;
  tag: string;
  standardConditions: boolean;
}

export interface CoachChatMessage {
  id: string;
  sender: 'ai' | 'user';
  timestamp: string;
  content: string;
  subType?: 'sparkline' | 'telemetry' | 'recommendation';
  sparklineData?: {
    label: string;
    value: string;
    tag: string;
    sublabel: string;
  };
  telemetryData?: {
    shoulderRecov: number;
    tricepLoad: number;
    actionLabel: string;
  };
}
