import type { FeedbackTier } from '../lib/api'

interface ExerciseSelectorProps {
  selectedExercise: string
  onSelectExercise: (exercise: string) => void
  selectedTier: FeedbackTier
  onSelectTier: (tier: FeedbackTier) => void
}

const EXERCISES = [
  { id: 'squat', label: 'Squat', icon: '🏋️' },
  { id: 'deadlift', label: 'Deadlift', icon: '⚡' },
  { id: 'pushup', label: 'Pushup', icon: '💪' },
]

export default function ExerciseSelector({
  selectedExercise,
  onSelectExercise,
  selectedTier,
  onSelectTier,
}: ExerciseSelectorProps) {
  return (
    <div className="exercise-selector">
      <div className="exercise-selector__group">
        <label className="exercise-selector__label">Exercise</label>
        <div className="exercise-selector__pills">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={`exercise-pill ${selectedExercise === ex.id ? 'exercise-pill--active' : ''}`}
              onClick={() => onSelectExercise(ex.id)}
            >
              <span className="exercise-pill__icon">{ex.icon}</span>
              <span className="exercise-pill__text">{ex.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="exercise-selector__divider" />

      <div className="exercise-selector__group">
        <label className="exercise-selector__label">Feedback Tier</label>
        <div className="tier-toggle">
          <button
            type="button"
            className={`tier-toggle__option ${selectedTier === 'beginner' ? 'tier-toggle__option--active' : ''}`}
            onClick={() => onSelectTier('beginner')}
          >
            <span className="tier-toggle__badge">Beginner</span>
          </button>

          <button
            type="button"
            className={`tier-toggle__option tier-toggle__option--advanced ${selectedTier === 'advanced' ? 'tier-toggle__option--active' : ''}`}
            onClick={() => onSelectTier('advanced')}
          >
            <span className="tier-toggle__badge">🔬 Advanced</span>
          </button>
        </div>
      </div>
    </div>
  )
}
