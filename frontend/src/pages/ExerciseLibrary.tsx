import { useNavigate } from 'react-router-dom'
import { EXERCISE_CONFIGS } from '../lib/exercises'

export default function ExerciseLibrary() {
  const navigate = useNavigate()

  const exercisesList = [
    {
      id: 'squat',
      title: 'Barbell / Bodyweight Squat',
      icon: '🏋️',
      config: EXERCISE_CONFIGS.squat,
      tip: 'Drive knees outward in line with toes during descent to prevent inward valgus collapse.',
      jointsTracked: ['Hip Joint', 'Knee Joint', 'Ankle Joint', 'Spinal Angle'],
    },
    {
      id: 'deadlift',
      title: 'Conventional Deadlift',
      icon: '⚡',
      config: EXERCISE_CONFIGS.deadlift,
      tip: 'Engage latissimus dorsi to lock the barbell over your mid-foot center of pressure before leg drive.',
      jointsTracked: ['Hip Hinge', 'Knee Flexion', 'Lumbar Spine Alignment'],
    },
    {
      id: 'pushup',
      title: 'Closed Kinetic Pushup',
      icon: '💪',
      config: EXERCISE_CONFIGS.pushup,
      tip: 'Tuck elbows to 45° relative to torso to optimize pectoral recruitment while protecting shoulders.',
      jointsTracked: ['Elbow Extension', 'Shoulder Abduction', 'Hip Plank Neutrality'],
    },
  ]

  const handleStartWorkout = (exerciseId: string) => {
    navigate(`/workout?exercise=${exerciseId}`)
  }

  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="readout-tag readout-tag--signal" style={{ marginBottom: '1rem' }}>
          MOVEMENT LIBRARY & SPECIFICATIONS
        </div>
        <h1 className="heading-display" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Supported Movement Patterns
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Select an exercise below to view tracked anatomical joints, key form pointers, and launch a live pose session.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {exercisesList.map((ex) => (
          <div key={ex.id} className="card-surface" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2.2rem' }}>{ex.icon}</span>
                <span className="readout-tag font-mono">
                  PRIMARY — {ex.config.phaseTransitions.primaryJoint?.toUpperCase()}
                </span>
              </div>

              <h2 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>
                {ex.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {ex.config.description}
              </p>

              {/* Form Tip Callout */}
              <div style={{ background: 'rgba(198, 255, 61, 0.05)', borderLeft: '3px solid var(--signal)', padding: '0.75rem 1rem', borderRadius: '0 var(--radius) var(--radius) 0', marginBottom: '1.25rem' }}>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--signal)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  FORM TIP
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {ex.tip}
                </div>
              </div>

              {/* Joints Tracked List */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  TRACKED ANATOMICAL JOINTS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {ex.jointsTracked.map((j) => (
                    <span key={j} className="readout-tag font-mono" style={{ fontSize: '0.68rem' }}>
                      {j}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleStartWorkout(ex.id)}
              style={{ width: '100%' }}
            >
              Start {ex.config.exercise.toUpperCase()} Workout →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
