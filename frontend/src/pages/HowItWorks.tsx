import { Link } from 'react-router-dom'

export default function HowItWorks() {
  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="readout-tag readout-tag--signal" style={{ marginBottom: '1rem' }}>
          TECHNICAL ARCHITECTURE & SPECIFICATIONS
        </div>
        <h1 className="heading-display" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          How Flexion Computes Form in Real-Time
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          A breakdown of our browser-native computer vision pipeline, vector landmark geometry engine, and retrieval-augmented coaching architecture.
        </p>
      </div>

      {/* ── Section 1: MediaPipe Vision Pipeline ────────────────────── */}
      <section className="card-surface" style={{ marginBottom: '2rem' }}>
        <div className="readout-tag font-mono" style={{ marginBottom: '1rem' }}>
          LAYER 01 — COMPUTER VISION & LANDMARK TRACKING
        </div>
        <h2 className="heading-display" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
          MediaPipe Pose 33-Point Estimation
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Flexion utilizes Google’s MediaPipe Pose vision model executing directly inside WebAssembly (WASM) and WebGL contexts in your browser. The pipeline predicts 33 three-dimensional anatomical landmarks (x, y, z) per frame alongside visibility metrics at up to 60 frames per second.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(237, 237, 232, 0.03)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--signal)', marginBottom: '0.25rem' }}>INFERENCE LATENCY</div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>&lt; 16ms / frame</div>
          </div>
          <div style={{ background: 'rgba(237, 237, 232, 0.03)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--signal)', marginBottom: '0.25rem' }}>LANDMARK PRECISION</div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>33 Keypoints (3D)</div>
          </div>
          <div style={{ background: 'rgba(237, 237, 232, 0.03)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--signal)', marginBottom: '0.25rem' }}>DATA PRIVACY</div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>100% Local (Client-side)</div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Angle Math & Vector Geometry ────────────────── */}
      <section className="card-surface" style={{ marginBottom: '2rem' }}>
        <div className="readout-tag font-mono" style={{ marginBottom: '1rem' }}>
          LAYER 02 — VECTOR GEOMETRY & STATE MACHINE
        </div>
        <h2 className="heading-display" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
          Joint Angle Calculation & Phase Detection
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Joint angles are computed using 3D vector dot-products at key anatomical vertices (e.g. Hip → Knee → Ankle for knee flexion). A finite state machine monitors phase transitions with hysteresis to prevent frame jitter:
        </p>

        <div className="font-mono" style={{ background: '#0d0f13', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--signal)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
          cos(θ) = (BA · BC) / (|BA| × |BC|)<br />
          θ_degrees = arccos(cos(θ)) * (180 / π)<br /><br />
          STANDING (160-180°) → DESCENDING → BOTTOM (70-100°) → ASCENDING → REPS++
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Form deviations (such as dynamic knee valgus collapse or lumbar spine flexion under load) are evaluated precisely at the bottom phase threshold when joint reaction forces peak.
        </p>
      </section>

      {/* ── Section 3: FAISS RAG Store & LLM Feedback ────────────────── */}
      <section className="card-surface" style={{ marginBottom: '3rem' }}>
        <div className="readout-tag font-mono" style={{ marginBottom: '1rem' }}>
          LAYER 03 — RAG STORE & BIOMECHANICS RETRIEVAL
        </div>
        <h2 className="heading-display" style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
          Sentence Embeddings & FAISS Research Retrieval
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          When form breakdown occurs, the backend constructs a query from the specific exercise and joint deviation. A FAISS index performs dense vector similarity search over a curated corpus of peer-reviewed biomechanics research abstracts:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
            <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.5rem' }}>BEGINNER TIER</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Concise Direct Cues</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Non-technical, actionable verbal cues (max 15 words) designed for real-time in-session adjustment.
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
            <div className="readout-tag readout-tag--signal" style={{ marginBottom: '0.5rem' }}>ADVANCED TIER</div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Biomechanical Grounding</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              2-3 sentence technical breakdowns synthesizing research abstracts on joint moment arms and ligament tension.
            </p>
          </div>
        </div>
      </section>

      <div style={{ textAlign: 'center' }}>
        <Link to="/workout" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
          Test the Engine Live →
        </Link>
      </div>
    </div>
  )
}
