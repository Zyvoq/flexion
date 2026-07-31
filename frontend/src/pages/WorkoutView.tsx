import { useRef, useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CameraFeed, { type CameraFeedHandle } from '../components/CameraFeed'
import PoseOverlay from '../components/PoseOverlay'
import DebugPanel from '../components/DebugPanel'
import RepCounter from '../components/RepCounter'
import FeedbackPanel from '../components/FeedbackPanel'
import ExerciseSelector from '../components/ExerciseSelector'
import { usePoseDetection } from '../hooks/usePoseDetection'
import { useAngleCalculator } from '../hooks/useAngleCalculator'
import { useRepStateMachine } from '../hooks/useRepStateMachine'
import { useFeedback } from '../hooks/useFeedback'
import { getExerciseConfig } from '../lib/exercises'
import { useAuth } from '../context/AuthContext'
import { saveWorkoutSession } from '../lib/telemetryService'
import type { FeedbackTier } from '../lib/api'

const VIDEO_WIDTH = 1280
const VIDEO_HEIGHT = 720

export default function WorkoutView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, profile } = useAuth()

  // Requirement 7: Pre-select user's favorite_exercise and default_tier from profile
  const preferredExercise = searchParams.get('exercise') || profile?.favorite_exercise || 'squat'
  const preferredTier = (profile?.default_tier as FeedbackTier) || 'advanced'

  const [exercise, setExercise] = useState<string>(preferredExercise)
  const [tier, setTier] = useState<FeedbackTier>(preferredTier)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionStartTime] = useState<number>(() => Date.now())

  // Keep state synced if URL query parameter changes
  useEffect(() => {
    const ex = searchParams.get('exercise')
    if (ex && ['squat', 'deadlift', 'pushup'].includes(ex)) {
      setExercise(ex)
    }
  }, [searchParams])

  // Update tier if profile default_tier updates
  useEffect(() => {
    if (profile?.default_tier) {
      setTier(profile.default_tier as FeedbackTier)
    }
  }, [profile?.default_tier])

  const exerciseConfig = getExerciseConfig(exercise)
  const cameraRef = useRef<CameraFeedHandle>(null)

  const handleStreamReady = useCallback(() => setIsStreaming(true), [])

  const videoRef = {
    get current() {
      return cameraRef.current?.video ?? null
    },
  } as React.RefObject<HTMLVideoElement | null>

  const { landmarks, isDetecting } = usePoseDetection(videoRef, isStreaming)
  const angles = useAngleCalculator(landmarks, exerciseConfig)
  const { phase, repCount, deviations } = useRepStateMachine(angles, exerciseConfig)
  const { correction, tier: feedbackTier, apiError } = useFeedback(deviations, exercise, tier)

  // Track session stats in ref for reliable unmount persistence
  const sessionStatsRef = useRef({ repCount, deviationsCount: deviations.length, exercise })
  useEffect(() => {
    sessionStatsRef.current = { repCount, deviationsCount: deviations.length, exercise }
  }, [repCount, deviations.length, exercise])

  // Requirement 3 & 4: Persist session and update leaderboard on unmount or session end
  useEffect(() => {
    return () => {
      const stats = sessionStatsRef.current
      if (stats.repCount > 0 && (user?.id || profile?.id)) {
        const userId = user?.id || profile?.id || 'demo_user'
        const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000)
        saveWorkoutSession(userId, stats.exercise, stats.repCount, stats.deviationsCount, durationSeconds)
      }
    }
  }, [user?.id, profile?.id, sessionStartTime])

  const handleExerciseChange = (newEx: string) => {
    // If completed reps in current exercise before switching, save session
    if (repCount > 0 && (user?.id || profile?.id)) {
      const userId = user?.id || profile?.id || 'demo_user'
      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000)
      saveWorkoutSession(userId, exercise, repCount, deviations.length, durationSeconds)
    }
    setExercise(newEx)
    setSearchParams({ exercise: newEx })
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div className="app__header">
        <ExerciseSelector
          selectedExercise={exercise}
          onSelectExercise={handleExerciseChange}
          selectedTier={tier}
          onSelectTier={setTier}
        />
      </div>

      <div className="pose-container" style={{ maxWidth: VIDEO_WIDTH }}>
        <CameraFeed ref={cameraRef} onStreamReady={handleStreamReady} />
        <PoseOverlay
          landmarks={landmarks}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
        />

        {isStreaming && (
          <div className="status-badge" data-detecting={isDetecting}>
            <span className="status-badge__dot" />
            {isDetecting ? 'Tracking' : 'No pose detected'}
          </div>
        )}

        <RepCounter
          repCount={repCount}
          phase={phase}
          deviations={deviations}
          visible={isDetecting}
        />

        <FeedbackPanel correction={correction} tier={feedbackTier} apiError={apiError} />

        <DebugPanel angles={angles} visible={isDetecting} exerciseConfig={exerciseConfig} />
      </div>
    </div>
  )
}
