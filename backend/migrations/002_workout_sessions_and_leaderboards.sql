-- =====================================================================
-- Migration 002: Workout Session Persistence & Leaderboard Schema
-- =====================================================================

-- 1. Workout Sessions Table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('squat', 'deadlift', 'pushup')),
    rep_count INTEGER NOT NULL DEFAULT 0,
    deviations_count INTEGER NOT NULL DEFAULT 0,
    session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on Workout Sessions
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can view their own workout sessions"
    ON public.workout_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workout sessions" ON public.workout_sessions;
CREATE POLICY "Users can insert their own workout sessions"
    ON public.workout_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2. Leaderboard Entries Table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN ('squat', 'deadlift', 'pushup')),
    best_form_score INTEGER NOT NULL DEFAULT 0,
    total_reps INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT leaderboard_entries_user_exercise_key UNIQUE (user_id, exercise_type)
);

-- Enable RLS on Leaderboard Entries
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view leaderboard entries" ON public.leaderboard_entries;
CREATE POLICY "Anyone can view leaderboard entries"
    ON public.leaderboard_entries FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can manage their own leaderboard entry" ON public.leaderboard_entries;
CREATE POLICY "Users can manage their own leaderboard entry"
    ON public.leaderboard_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
