import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchUserWorkoutSessions, type DbWorkoutSession } from '../lib/telemetryService'

export default function WorkoutHistory() {
  const { user, profile } = useAuth()
  const [sessions, setSessions] = useState<DbWorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const userId = user?.id || profile?.id || 'demo_user'

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      const data = await fetchUserWorkoutSessions(userId)
      setSessions(data)
      setLoading(false)
    }
    loadHistory()
  }, [userId])

  const filteredSessions = filter === 'all'
    ? sessions
    : sessions.filter((s) => s.exercise_type === filter)

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.5rem' }}>
            TELEMETRY REPOSITORY
          </div>
          <h1 className="heading-display" style={{ fontSize: '2.25rem' }}>
            Workout History Log
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Historical session logs, clean rep metrics, and flagged form deviations.
          </p>
        </div>

        {/* Exercise Filter Pills */}
        <div className="exercise-selector">
          {['all', 'squat', 'deadlift', 'pushup'].map((f) => (
            <button
              key={f}
              type="button"
              className={`exercise-pill ${filter === f ? 'exercise-pill--active' : ''}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <span className="readout-tag readout-tag--signal font-mono">LOADING SESSION LOGS...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No sessions match the selected filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>DATE / TIME</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>EXERCISE</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>REPS</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>DURATION</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>FORM SCORE</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>DEVIATIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(237, 237, 232, 0.04)' }}>
                    <td className="font-mono" style={{ fontSize: '0.85rem', padding: '1rem', color: 'var(--text-primary)' }}>
                      {new Date(s.session_date).toISOString().replace('T', ' ').substring(0, 16)}
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize', fontWeight: 600 }}>
                      {s.exercise_type}
                    </td>
                    <td className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--signal)', padding: '1rem' }}>
                      {s.rep_count}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.88rem', padding: '1rem', color: 'var(--text-secondary)' }}>
                      {s.duration_seconds}s
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, padding: '1rem', color: 'var(--signal)' }}>
                      {s.form_score}%
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`readout-tag ${s.deviations_count === 0 ? 'readout-tag--signal' : 'readout-tag--alert'}`}>
                        {s.deviations_count === 0 ? 'CLEAN FORM' : `${s.deviations_count} ISSUES`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
