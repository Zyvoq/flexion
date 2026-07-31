import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfileSettings() {
  const { profile, user, updateProfileData, authError } = useAuth()

  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [favoriteExercise, setFavoriteExercise] = useState(profile?.favorite_exercise || 'squat')
  const [defaultTier, setDefaultTier] = useState<'beginner' | 'advanced'>(profile?.default_tier || 'advanced')
  const [savedMessage, setSavedMessage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name)
      setFavoriteExercise(profile.favorite_exercise)
      setDefaultTier(profile.default_tier)
    }
  }, [profile])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSavedMessage(false)
    try {
      await updateProfileData({
        display_name: displayName,
        favorite_exercise: favoriteExercise,
        default_tier: defaultTier,
      })
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch {
      // Error handled in AuthContext authError
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.5rem' }}>
          SUPABASE PROFILE MANAGEMENT
        </div>
        <h1 className="heading-display" style={{ fontSize: '2.25rem' }}>
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Update your display name, default feedback tier, and primary movement preferences.
        </p>
      </div>

      <div className="card-surface" style={{ maxWidth: '640px' }}>
        {savedMessage && (
          <div className="readout-tag readout-tag--signal" style={{ width: '100%', padding: '0.6rem 1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            ✓ PROFILE UPDATED SUCCESSFULLY
          </div>
        )}

        {authError && (
          <div className="readout-tag readout-tag--alert" style={{ width: '100%', padding: '0.6rem 1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Display Name
            </label>
            <input
              type="text"
              className="input-field"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Email Address (Supabase Account)
            </label>
            <input
              type="email"
              className="input-field"
              value={user?.email || profile?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Favorite Movement
            </label>
            <select
              className="input-field"
              value={favoriteExercise}
              onChange={(e) => setFavoriteExercise(e.target.value)}
            >
              <option value="squat">Squat (Knee / Hip)</option>
              <option value="deadlift">Deadlift (Hip / Spine)</option>
              <option value="pushup">Pushup (Elbow / Shoulder)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Default Feedback Tier
            </label>
            <div className="tier-toggle" style={{ width: 'fit-content' }}>
              <button
                type="button"
                className={`tier-toggle__option ${defaultTier === 'beginner' ? 'tier-toggle__option--active' : ''}`}
                onClick={() => setDefaultTier('beginner')}
              >
                Beginner
              </button>
              <button
                type="button"
                className={`tier-toggle__option tier-toggle__option--advanced ${defaultTier === 'advanced' ? 'tier-toggle__option--active' : ''}`}
                onClick={() => setDefaultTier('advanced')}
              >
                🔬 Advanced Biomechanics
              </button>
            </div>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : 'Save Profile Changes →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
