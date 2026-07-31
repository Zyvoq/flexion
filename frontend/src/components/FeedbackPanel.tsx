import { useState, useEffect } from 'react'
import type { FeedbackTier } from '../lib/api'

interface FeedbackPanelProps {
  correction: string | null
  tier?: FeedbackTier
  apiError?: string | null
}

/**
 * Displays the latest LLM-generated coaching correction or API status alerts.
 * Rendered as a single-line alert for 'beginner' tier, or an expandable
 * biomechanical breakdown card for 'advanced' tier.
 */
export default function FeedbackPanel({
  correction,
  tier = 'beginner',
  apiError,
}: FeedbackPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Expand card whenever a new advanced correction is received
  useEffect(() => {
    if (correction && tier === 'advanced') {
      setIsExpanded(true)
    }
  }, [correction, tier])

  if (apiError && !correction) {
    return (
      <div className="feedback-panel feedback-panel--beginner" style={{ borderColor: 'var(--color-error)' }}>
        <span className="feedback-panel__icon">📡</span>
        <p className="feedback-panel__text" style={{ color: 'var(--color-warning)' }}>{apiError}</p>
      </div>
    )
  }

  if (!correction) return null

  if (tier === 'beginner') {
    return (
      <div className="feedback-panel feedback-panel--beginner" key={correction}>
        <span className="feedback-panel__icon">💡</span>
        <p className="feedback-panel__text">{correction}</p>
      </div>
    )
  }

  return (
    <div className="feedback-panel feedback-panel--advanced" key={correction}>
      <div className="feedback-card">
        <div className="feedback-card__header" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="feedback-card__title-group">
            <span className="feedback-card__icon">🔬</span>
            <span className="feedback-card__title">Biomechanical Analysis</span>
            <span className="feedback-card__badge">Advanced Tier</span>
          </div>
          <button
            type="button"
            className="feedback-card__toggle"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        {isExpanded && (
          <div className="feedback-card__content">
            <p className="feedback-card__text">{correction}</p>
            <div className="feedback-card__footer">
              <span className="feedback-card__tag">⚡ FAISS RAG Context</span>
              <span className="feedback-card__tag">Anatomical Alignment</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
