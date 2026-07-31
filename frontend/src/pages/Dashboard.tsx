import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { profile, user } = useAuth()

  const totalSessions = 4
  const currentStreak = 5
  const favoriteExercise = profile?.favorite_exercise || 'squat'
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Athlete'

  const mockSessions = [
    {
      id: 'ses_101',
      exercise: 'squat',
      date: '2026-07-31T18:30:00Z',
      reps: 12,
      durationSeconds: 145,
      formScore: 94,
      deviationsCount: 1,
    },
    {
      id: 'ses_102',
      exercise: 'deadlift',
      date: '2026-07-30T17:15:00Z',
      reps: 8,
      durationSeconds: 110,
      formScore: 98,
      deviationsCount: 0,
    },
    {
      id: 'ses_103',
      exercise: 'pushup',
      date: '2026-07-29T09:45:00Z',
      reps: 20,
      durationSeconds: 95,
      formScore: 90,
      deviationsCount: 2,
    },
  ]

  return (
    <div className="page-wrapper">
      {/* ── Welcome Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.5rem' }}>
            ATHLETE DASHBOARD — ONLINE
          </div>
          <h1 className="heading-display" style={{ fontSize: '2.25rem' }}>
            Welcome back, {displayName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Ready for today's form check? Select an exercise to launch real-time pose tracking.
          </p>
        </div>

        <Link to="/workout" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
          ⚡ Start Workout
        </Link>
      </div>

      {/* ── Quick Stats Row (JetBrains Mono Numerals) ──────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        <div className="card-surface">
          <div className="readout-tag font-mono" style={{ marginBottom: '0.5rem' }}>TOTAL SESSIONS</div>
          <div className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--signal)' }}>
            {totalSessions}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Completed form checks
          </div>
        </div>

        <div className="card-surface">
          <div className="readout-tag font-mono" style={{ marginBottom: '0.5rem' }}>CURRENT STREAK</div>
          <div className="font-mono" style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--signal)' }}>
            {currentStreak} <span style={{ fontSize: '1rem', fontWeight: 500 }}>DAYS</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Consecutive training days
          </div>
        </div>

        <div className="card-surface">
          <div className="readout-tag font-mono" style={{ marginBottom: '0.5rem' }}>FAVORITE MOVEMENT</div>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginTop: '0.4rem' }}>
            {favoriteExercise}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Most practiced exercise
          </div>
        </div>
      </div>

      {/* ── Recent Sessions Preview Section ──────────────────────────── */}
      <section className="card-surface">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="readout-tag font-mono" style={{ marginBottom: '0.3rem' }}>TELEMETRY LOG</div>
            <h2 className="heading-display" style={{ fontSize: '1.4rem' }}>Recent Workout Sessions</h2>
          </div>
          <Link to="/history" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            View Full History →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mockSessions.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: 'rgba(237, 237, 232, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.4rem' }}>
                  {s.exercise === 'squat' ? '🏋️' : s.exercise === 'deadlift' ? '⚡' : '💪'}
                </span>
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '1rem' }}>
                    {s.exercise}
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(s.date).toLocaleDateString()} — {Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--signal)' }}>
                    {s.reps} REPS
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    FORM SCORE: {s.formScore}%
                  </div>
                </div>

                <div className={`readout-tag ${s.deviationsCount === 0 ? 'readout-tag--signal' : 'readout-tag--alert'}`}>
                  {s.deviationsCount === 0 ? 'CLEAN FORM' : `${s.deviationsCount} ISSUES`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
