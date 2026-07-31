import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchLeaderboardEntries, type DbLeaderboardEntry } from '../lib/telemetryService'

export default function Leaderboard() {
  const { user, profile } = useAuth()
  const [exerciseFilter, setExerciseFilter] = useState('all')
  const [entries, setEntries] = useState<DbLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const currentUserId = user?.id || profile?.id

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true)
      const data = await fetchLeaderboardEntries(exerciseFilter)
      setEntries(data)
      setLoading(false)
    }
    loadLeaderboard()
  }, [exerciseFilter])

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.5rem' }}>
            GLOBAL ATHLETE RANKINGS
          </div>
          <h1 className="heading-display" style={{ fontSize: '2.25rem' }}>
            Form Quality Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Rankings calculated from verified clean rep completions and biomechanical form precision.
          </p>
        </div>

        {/* Exercise Filter Pills */}
        <div className="exercise-selector">
          {['all', 'squat', 'deadlift', 'pushup'].map((ex) => (
            <button
              key={ex}
              type="button"
              className={`exercise-pill ${exerciseFilter === ex ? 'exercise-pill--active' : ''}`}
              onClick={() => setExerciseFilter(ex)}
              style={{ textTransform: 'capitalize' }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <span className="readout-tag readout-tag--signal font-mono">LOADING LEADERBOARD RANKINGS...</span>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            No leaderboard entries found for this exercise filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>RANK</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>ATHLETE</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>EXERCISE</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>BEST FORM SCORE</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>TOTAL REPS</th>
                  <th className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem' }}>LAST UPDATED</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item, idx) => {
                  const rank = idx + 1
                  const isCurrentUser = item.user_id === currentUserId
                  const displayName = item.profiles?.display_name || 'Athlete'

                  return (
                    <tr
                      key={`${item.user_id}-${item.exercise_type}`}
                      style={{
                        borderBottom: '1px solid rgba(237, 237, 232, 0.04)',
                        background: isCurrentUser ? 'rgba(198, 255, 61, 0.05)' : 'transparent',
                      }}
                    >
                      <td className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: rank === 1 ? '#FFD700' : 'var(--text-primary)', padding: '1rem' }}>
                        #{rank}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: isCurrentUser ? 700 : 500 }}>
                        {displayName} {isCurrentUser && <span className="readout-tag readout-tag--signal" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>YOU</span>}
                      </td>
                      <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {item.exercise_type}
                      </td>
                      <td className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--signal)', padding: '1rem' }}>
                        {item.best_form_score}%
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, padding: '1rem' }}>
                        {item.total_reps}
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '1rem' }}>
                        {new Date(item.updated_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
