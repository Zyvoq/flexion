import type { SquatPhase } from '../hooks/useRepStateMachine'
import type { FormDeviation } from '../lib/deviations'

interface RepCounterProps {
  repCount: number
  phase: SquatPhase
  deviations: FormDeviation[]
  visible: boolean
}

const PHASE_LABELS: Record<SquatPhase, string> = {
  standing: 'STANDING',
  descending: 'DESCENDING',
  bottom: 'BOTTOM',
  ascending: 'ASCENDING',
}

/**
 * Displays live rep count, phase state, and active form deviations.
 * Uses JetBrains Mono for numerals, --signal (#C6FF3D) for tracking, and --alert (#FF6B4A) for deviations.
 */
export default function RepCounter({ repCount, phase, deviations, visible }: RepCounterProps) {
  if (!visible) return null

  return (
    <div className="rep-counter">
      <div className="rep-counter__count font-mono">{repCount}</div>
      <div className="rep-counter__label font-mono">REPS</div>
      <div className="rep-counter__phase font-mono" data-phase={phase}>
        {PHASE_LABELS[phase]}
      </div>

      {deviations.length > 0 && (
        <div className="rep-counter__deviations">
          {deviations.map((d, i) => (
            <div
              key={`${d.joint}-${d.issue}-${i}`}
              className="rep-counter__deviation"
            >
              <span className="rep-counter__deviation-issue font-mono">
                {formatIssue(d.issue)}
              </span>
              <span className="rep-counter__deviation-severity font-mono" data-severity={d.severity}>
                {d.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatIssue(issue: string): string {
  return issue
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
