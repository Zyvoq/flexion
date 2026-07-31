import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div
        className="card-surface"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '3rem 2rem',
          textAlign: 'center',
          borderColor: 'var(--alert-dim)',
        }}
      >
        <div className="readout-tag readout-tag--alert" style={{ marginBottom: '1.25rem' }}>
          DIAGNOSTIC STATUS — 404 NOT_FOUND
        </div>

        <h1
          className="font-mono"
          style={{
            fontSize: '5rem',
            fontWeight: 800,
            color: 'var(--alert)',
            lineHeight: 1,
            marginBottom: '0.5rem',
            textShadow: '0 0 20px var(--alert-dim)',
          }}
        >
          404
        </h1>

        <h2 className="heading-display" style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>
          Landmark Path Occluded
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          The requested coordinate or page vector could not be located in the current workspace telemetry.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
