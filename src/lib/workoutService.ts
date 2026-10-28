import { supabase } from './supabase';
import { WorkoutSession, ExerciseItem, WorkoutSet } from '../types';

export interface DbExercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  movement_type: string;
  target_muscle?: string;
  description?: string;
}

/**
 * Fetch all available exercises from Supabase (system presets + user custom)
 */
export async function fetchExercisesFromDb(): Promise<DbExercise[]> {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('is_archived', false)
      .order('muscle_group', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.warn('Error fetching exercises from DB:', error.message);
      return [];
    }
    return (data || []) as DbExercise[];
  } catch (err) {
    console.error('Exception fetching exercises:', err);
    return [];
  }
}

/**
 * Start and persist a new workout session in Supabase
 */
export async function startDbWorkoutSession(
  userId: string,
  sessionName: string,
  targetRpe = 8.5
): Promise<string> {
  const sessionId = crypto.randomUUID();
  try {
    const { error } = await supabase.from('workout_sessions').insert({
      id: sessionId,
      user_id: userId,
      name: sessionName,
      started_at: new Date().toISOString(),
      target_rpe: targetRpe,
    });

    if (error) {
      console.warn('Error creating workout session in DB:', error.message);
    }
  } catch (err) {
    console.error('Exception in startDbWorkoutSession:', err);
  }
  return sessionId;
}

/**
 * Link an exercise to the active workout session in Supabase
 */
export async function addExerciseToDbSession(
  sessionId: string,
  userId: string,
  exerciseId: string,
  position: number
): Promise<string> {
  const workoutExerciseId = crypto.randomUUID();
  try {
    const { error } = await supabase.from('workout_exercises').insert({
      id: workoutExerciseId,
      session_id: sessionId,
      user_id: userId,
      exercise_id: exerciseId,
      position,
    });

    if (error) {
      console.warn('Error adding workout exercise to DB:', error.message);
    }
  } catch (err) {
    console.error('Exception in addExerciseToDbSession:', err);
  }
  return workoutExerciseId;
}

/**
 * Log a completed set using the atomic Epley PR engine RPC
 */
export async function logWorkoutSetRpc(params: {
  setId: string;
  workoutExerciseId: string;
  userId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rir?: number;
  isWarmup?: boolean;
}): Promise<{
  id: string;
  e1rm: number;
  is_pr_weight: boolean;
  is_pr_e1rm: boolean;
} | null> {
  try {
    const { data, error } = await supabase.rpc('log_workout_set', {
      p_id: params.setId,
      p_workout_exercise_id: params.workoutExerciseId,
      p_user_id: params.userId,
      p_set_number: params.setNumber,
      p_weight_kg: params.weightKg,
      p_reps: params.reps,
      p_rir: params.rir ?? 1,
      p_is_warmup: params.isWarmup ?? false,
    });

    if (error) {
      console.warn('Error executing log_workout_set RPC:', error.message);
      // Fallback: simple upsert if RPC has an issue
      await supabase.from('workout_sets').upsert({
        id: params.setId,
        workout_exercise_id: params.workoutExerciseId,
        user_id: params.userId,
        set_number: params.setNumber,
        weight_kg: params.weightKg,
        reps: params.reps,
        rir: params.rir ?? 1,
        is_warmup: params.isWarmup ?? false,
        completed_at: new Date().toISOString(),
      });
      return {
        id: params.setId,
        e1rm: Math.round(params.weightKg * (1 + params.reps / 30)),
        is_pr_weight: false,
        is_pr_e1rm: false,
      };
    }

    return data;
  } catch (err) {
    console.error('Exception in logWorkoutSetRpc:', err);
    return null;
  }
}

/**
 * Finalize and save completed workout session stats (duration, tonnage)
 */
export async function finishDbWorkoutSession(
  sessionId: string,
  userId: string,
  durationMinutes: number,
  tonnageKg: number,
  notes?: string
) {
  try {
    const { error } = await supabase
      .from('workout_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        tonnage_kg: tonnageKg,
        notes: notes || null,
      })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error finishing workout session in DB:', error.message);
    }
  } catch (err) {
    console.error('Exception in finishDbWorkoutSession:', err);
  }
}

