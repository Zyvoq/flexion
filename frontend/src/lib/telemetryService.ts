import { supabase, isSupabaseConfigured } from './supabase'

export interface DbWorkoutSession {
  id: string
  user_id: string
  exercise_type: string
  rep_count: number
  deviations_count: number
  session_date: string
  duration_seconds: number
  form_score?: number
}

export interface DbLeaderboardEntry {
  user_id: string
  exercise_type: string
  best_form_score: number
  total_reps: number
  updated_at: string
  profiles?: {
    display_name: string
  } | null
}

// In-memory local fallback storage for dev mode without live Supabase env
const localSessionsMemory: DbWorkoutSession[] = [
  {
    id: 'loc_1',
    user_id: 'demo_user',
    exercise_type: 'squat',
    rep_count: 14,
    deviations_count: 1,
    session_date: new Date(Date.now() - 3600000).toISOString(),
    duration_seconds: 120,
    form_score: 93,
  },
  {
    id: 'loc_2',
    user_id: 'demo_user',
    exercise_type: 'deadlift',
    rep_count: 8,
    deviations_count: 0,
    session_date: new Date(Date.now() - 86400000).toISOString(),
    duration_seconds: 90,
    form_score: 100,
  },
]

const localLeaderboardMemory: DbLeaderboardEntry[] = [
  {
    user_id: 'usr_1',
    exercise_type: 'squat',
    best_form_score: 98,
    total_reps: 420,
    updated_at: new Date().toISOString(),
    profiles: { display_name: 'Elena Rostova' },
  },
  {
    user_id: 'usr_2',
    exercise_type: 'squat',
    best_form_score: 95,
    total_reps: 385,
    updated_at: new Date().toISOString(),
    profiles: { display_name: 'Alex Vance' },
  },
  {
    user_id: 'usr_3',
    exercise_type: 'deadlift',
    best_form_score: 100,
    total_reps: 250,
    updated_at: new Date().toISOString(),
    profiles: { display_name: 'Marcus Chen' },
  },
  {
    user_id: 'usr_4',
    exercise_type: 'pushup',
    best_form_score: 92,
    total_reps: 310,
    updated_at: new Date().toISOString(),
    profiles: { display_name: 'Sarah Jenkins' },
  },
]

/**
 * Calculates form score percentage (0-100) based on reps with zero deviations.
 */
export function calculateFormScore(repCount: number, deviationsCount: number): number {
  if (repCount <= 0) return 100
  const cleanReps = Math.max(0, repCount - deviationsCount)
  return Math.round((cleanReps / repCount) * 100)
}

/**
 * Saves a completed workout session to Supabase 'workout_sessions' table
 * and updates or inserts into 'leaderboard_entries' if form score improves.
 */
export async function saveWorkoutSession(
  userId: string,
  exerciseType: string,
  repCount: number,
  deviationsCount: number,
  durationSeconds: number
): Promise<void> {
  if (repCount <= 0) return

  const formScore = calculateFormScore(repCount, deviationsCount)

  if (!isSupabaseConfigured) {
    // Development Fallback
    const newSession: DbWorkoutSession = {
      id: `loc_${Date.now()}`,
      user_id: userId,
      exercise_type: exerciseType,
      rep_count: repCount,
      deviations_count: deviationsCount,
      session_date: new Date().toISOString(),
      duration_seconds: durationSeconds,
      form_score: formScore,
    }
    localSessionsMemory.unshift(newSession)
    return
  }

  try {
    // 1. Insert session record
    const { error: sessionErr } = await supabase.from('workout_sessions').insert({
      user_id: userId,
      exercise_type: exerciseType,
      rep_count: repCount,
      deviations_count: deviationsCount,
      duration_seconds: durationSeconds,
      session_date: new Date().toISOString(),
    })

    if (sessionErr) {
      console.warn('[Flexion Telemetry] Failed to insert workout session:', sessionErr.message)
      return
    }

    // 2. Fetch existing leaderboard entry for this user + exercise
    const { data: existing } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_type', exerciseType)
      .single()

    const currentBest = existing ? existing.best_form_score : 0
    const newBestScore = Math.max(currentBest, formScore)
    const newTotalReps = (existing ? existing.total_reps : 0) + repCount

    // 3. Upsert leaderboard entry
    await supabase.from('leaderboard_entries').upsert(
      {
        user_id: userId,
        exercise_type: exerciseType,
        best_form_score: newBestScore,
        total_reps: newTotalReps,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,exercise_type' }
    )
  } catch (err) {
    console.warn('[Flexion Telemetry] Error persisting session telemetry:', err)
  }
}

/**
 * Fetches past workout sessions for the logged in user from Supabase.
 */
export async function fetchUserWorkoutSessions(userId: string): Promise<DbWorkoutSession[]> {
  if (!isSupabaseConfigured) {
    return localSessionsMemory.filter((s) => s.user_id === userId || true)
  }

  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })

    if (error) {
      console.warn('[Flexion Telemetry] Fetch sessions error:', error.message)
      return []
    }

    return (data || []).map((s) => ({
      ...s,
      form_score: calculateFormScore(s.rep_count, s.deviations_count),
    }))
  } catch {
    return []
  }
}

/**
 * Fetches top leaderboard entries filtered by exercise type.
 */
export async function fetchLeaderboardEntries(exerciseType: string): Promise<DbLeaderboardEntry[]> {
  if (!isSupabaseConfigured) {
    const filtered = exerciseType === 'all'
      ? localLeaderboardMemory
      : localLeaderboardMemory.filter((e) => e.exercise_type === exerciseType)
    return [...filtered].sort((a, b) => b.best_form_score - a.best_form_score)
  }

  try {
    let query = supabase
      .from('leaderboard_entries')
      .select('user_id, exercise_type, best_form_score, total_reps, updated_at, profiles(display_name)')
      .order('best_form_score', { ascending: false })
      .order('total_reps', { ascending: false })
      .limit(50)

    if (exerciseType !== 'all') {
      query = query.eq('exercise_type', exerciseType)
    }

    const { data, error } = await query

    if (error) {
      console.warn('[Flexion Telemetry] Fetch leaderboard error:', error.message)
      return []
    }

    return (data as unknown as DbLeaderboardEntry[]) || []
  } catch {
    return []
  }
}
