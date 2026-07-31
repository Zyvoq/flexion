import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signUp, authError, clearError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    clearError()
    setSubmitting(true)
    try {
      await signUp(email, password, displayName)
      navigate('/dashboard')
    } catch {
      // Error handled in AuthContext authError
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.75rem' }}>
            NEW ATHLETE REGISTRATION
          </div>
          <h1 className="heading-display" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Sign up for real-time form tracking and RAG coaching.
          </p>
        </div>

        {authError && (
          <div className="readout-tag readout-tag--alert" style={{ width: '100%', padding: '0.6rem 0.8rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
            ⚠️ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Display Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Alex Vance"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="alex.vance@flexion.fit"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '0.5rem', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--signal)', fontWeight: 600 }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
