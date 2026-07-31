import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  // Animated angle readouts simulation for the hero centerpiece
  const [kneeAngle, setKneeAngle] = useState(168)
  const [hipAngle, setHipAngle] = useState(172)
  const [phase, setPhase] = useState('TOP — LOCKOUT')

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      const time = Date.now() / 1000
      const sinVal = (Math.sin(time * 1.5) + 1) / 2 // 0 to 1 cycle
      const calculatedKnee = Math.round(175 - sinVal * 85) // 175 down to 90
      const calculatedHip = Math.round(175 - sinVal * 80) // 175 down to 95

      setKneeAngle(calculatedKnee)
      setHipAngle(calculatedHip)

      if (calculatedKnee < 110) {
        setPhase('BOTTOM — PARALLEL')
      } else if (sinVal > 0.5) {
        setPhase('ASCENDING — EXPULSION')
      } else {
        setPhase('DESCENDING — CONTROL')
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="page-wrapper">
      {/* ── Signature Visual Hero Section ────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '2rem 0 4rem' }}>
        <div className="readout-tag readout-tag--signal" style={{ marginBottom: '1.25rem' }}>
          <span>LIVE LANDMARK ENGINE — 60 FPS</span>
        </div>

        <h1
          className="heading-display"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', lineHeight: 1.1, maxWidth: '850px', margin: '0 auto 1.25rem' }}
        >
          Real-Time AI Form Analysis Powered by Biomechanical RAG
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 2rem' }}>
          Turn your webcam into an elite strength coach. Instant joint-angle calculation and peer-reviewed biomechanics coaching in real-time.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <Link to="/signup" className="btn-primary">
            Start Session Free →
          </Link>
          <Link to="/how-it-works" className="btn-secondary">
            Explore Architecture
          </Link>
        </div>

        {/* ── Signature Centerpiece Hero Visual ────────────────────────── */}
        <div
          className="card-surface"
          style={{
            maxWidth: '840px',
            margin: '0 auto',
            position: 'relative',
            padding: 0,
            overflow: 'hidden',
            aspectRatio: '16 / 9',
            background: '#0d0f13',
            border: '1px solid var(--border-active)',
            boxShadow: '0 20px 60px rgba(198, 255, 61, 0.08)',
          }}
        >
          {/* Animated Overlay HUD Graphic */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="readout-tag readout-tag--signal">
                <span>FORM: OPTIMAL</span>
              </div>
              <div className="readout-tag font-mono">
                <span>{phase}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>TRACKED JOINT</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--signal)', fontFamily: 'var(--font-mono)' }}>
                  KNEE — {kneeAngle}°
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>PRIMARY HINGE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--signal)', fontFamily: 'var(--font-mono)' }}>
                  HIP — {hipAngle}°
                </div>
              </div>
            </div>
          </div>

          {/* Canvas-like Skeleton Visualization Mockup */}
          <svg viewBox="0 0 800 450" style={{ width: '100%', height: '100%', opacity: 0.9 }}>
            {/* Grid overlay lines */}
            <line x1="0" y1="225" x2="800" y2="225" stroke="rgba(237, 237, 232, 0.05)" strokeDasharray="4 4" />
            <line x1="400" y1="0" x2="400" y2="450" stroke="rgba(237, 237, 232, 0.05)" strokeDasharray="4 4" />

            {/* Dynamic Skeleton Bones */}
            {/* Head */}
            <circle cx="400" cy={110 + (175 - kneeAngle) * 0.4} r="22" fill="none" stroke="#C6FF3D" strokeWidth="3" />
            {/* Torso line */}
            <line
              x1="400"
              y1={132 + (175 - kneeAngle) * 0.4}
              x2="400"
              y2={230 + (175 - kneeAngle) * 0.6}
              stroke="#C6FF3D"
              strokeWidth="4"
            />
            {/* Femur */}
            <line
              x1="400"
              y1={230 + (175 - kneeAngle) * 0.6}
              x2={400 - (175 - kneeAngle) * 0.8}
              y2={330 + (175 - kneeAngle) * 0.3}
              stroke="#C6FF3D"
              strokeWidth="4"
            />
            {/* Shin */}
            <line
              x1={400 - (175 - kneeAngle) * 0.8}
              y2="410"
              x2="370"
              y1={330 + (175 - kneeAngle) * 0.3}
              stroke="#C6FF3D"
              strokeWidth="4"
            />

            {/* Joint Nodes */}
            <circle cx="400" cy={230 + (175 - kneeAngle) * 0.6} r="6" fill="#C6FF3D" />
            <circle cx={400 - (175 - kneeAngle) * 0.8} cy={330 + (175 - kneeAngle) * 0.3} r="8" fill="#C6FF3D" />
            <circle cx="370" cy="410" r="6" fill="#C6FF3D" />

            {/* Live Angle Arc Indicator */}
            <text
              x={400 - (175 - kneeAngle) * 0.8 - 60}
              y={330 + (175 - kneeAngle) * 0.3}
              fill="#C6FF3D"
              fontSize="14"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              {kneeAngle}°
            </text>
          </svg>
        </div>
      </section>

      {/* ── Plain Language 3-Step Flow Section ───────────────────────── */}
      <section style={{ padding: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="readout-tag" style={{ marginBottom: '0.75rem' }}>ARCHITECTURE — THREE-STAGE PIPELINE</div>
          <h2 className="heading-display" style={{ fontSize: '2rem' }}>How Flexion Checks Your Form</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card-surface">
            <div className="readout-tag readout-tag--signal" style={{ marginBottom: '1rem' }}>
              STEP 01 — CAMERA
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Zero-Hardware Capture</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Flexion accesses your standard laptop or mobile camera directly through the browser. No wearables, sensors, or external hardware needed.
            </p>
          </div>

          <div className="card-surface">
            <div className="readout-tag readout-tag--signal" style={{ marginBottom: '1rem' }}>
              STEP 02 — DETECTION
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>33-Point Pose Tracking</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              MediaPipe Pose tracks 33 key anatomical landmarks at 60fps. Vector geometry calculates exact joint angles for knees, hips, back, and shoulders.
            </p>
          </div>

          <div className="card-surface">
            <div className="readout-tag readout-tag--signal" style={{ marginBottom: '1rem' }}>
              STEP 03 — FEEDBACK
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Biomechanical RAG Cues</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Form breakdown triggers FAISS vector retrieval across peer-reviewed fitness research abstracts, delivering instantaneous technical coaching.
            </p>
          </div>
        </div>
      </section>

      {/* ── Exercise Preview Cards Section ───────────────────────────── */}
      <section style={{ padding: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="readout-tag" style={{ marginBottom: '0.75rem' }}>SUPPORTED MOVEMENTS</div>
          <h2 className="heading-display" style={{ fontSize: '2rem' }}>Precision Exercise Coverage</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="card-surface">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>🏋️</span>
              <span className="readout-tag font-mono">PRIMARY — KNEE</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>Barbell / Bodyweight Squat</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Tracks knee valgus collapse, torso forward lean angle, depth parallel threshold, and lockout hyperextension.
            </p>
            <Link to="/exercises" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
              View Squat Specs →
            </Link>
          </div>

          <div className="card-surface">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>⚡</span>
              <span className="readout-tag font-mono">PRIMARY — HIP</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>Conventional Deadlift</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Monitors lumbar spine flexion, bar path drift away from mid-foot center of pressure, and knee lockout timing.
            </p>
            <Link to="/exercises" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
              View Deadlift Specs →
            </Link>
          </div>

          <div className="card-surface">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>💪</span>
              <span className="readout-tag font-mono">PRIMARY — ELBOW</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>Closed Kinetic Pushup</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Evaluates 45° elbow flaring vs 90° shoulder abduction strain, core hip plank alignment, and bottom chest depth.
            </p>
            <Link to="/exercises" className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
              View Pushup Specs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner & Footer ─────────────────────────────────────── */}
      <section
        className="card-surface"
        style={{
          marginTop: '4rem',
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          background: 'linear-gradient(180deg, var(--surface) 0%, rgba(198, 255, 61, 0.04) 100%)',
          borderColor: 'rgba(198, 255, 61, 0.2)',
        }}
      >
        <h2 className="heading-display" style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>
          Ready to Test Your Form?
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 2rem' }}>
          Start instant real-time pose tracking right in your browser. Choose between Beginner cues and Advanced research analysis.
        </p>
        <Link to="/signup" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
          Launch Flexion Now →
        </Link>
      </section>

      <footer
        style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="readout-tag font-mono">FLEXION v1.0</span>
          <span>© 2026 Flexion AI. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/how-it-works" className="navbar__link">Architecture</Link>
          <Link to="/exercises" className="navbar__link">Exercises</Link>
          <Link to="/login" className="navbar__link">Log In</Link>
        </div>
      </footer>
    </div>
  )
}
