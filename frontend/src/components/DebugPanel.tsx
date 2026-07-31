import type { JointAngles } from '../hooks/useAngleCalculator'
import { getExerciseConfig, type ExerciseConfig } from '../lib/exercises'

interface DebugPanelProps {
  angles: JointAngles
  visible: boolean
  exerciseConfig?: ExerciseConfig | string
}

function formatAngle(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)}°`
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Debug overlay showing live joint angle values dynamically per exercise.
 */
export default function DebugPanel({ angles, visible, exerciseConfig: inputConfig }: DebugPanelProps) {
  if (!visible) return null

  const exerciseConfig = typeof inputConfig === 'string'
    ? getExerciseConfig(inputConfig)
    : (inputConfig || getExerciseConfig('squat'))

  const rows: [string, number | null, number | null][] = []
  for (const jointName of Object.keys(exerciseConfig.joints)) {
    const cap = capitalize(jointName)
    rows.push([cap, angles[`left${cap}`], angles[`right${cap}`]])
  }

  return (
    <div className="debug-panel">
      <h3 className="debug-panel__title">{exerciseConfig.exercise} Angles</h3>
      <table className="debug-panel__table">
        <thead>
          <tr>
            <th>Joint</th>
            <th>Left</th>
            <th>Right</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([joint, left, right]) => (
            <tr key={joint}>
              <td>{joint}</td>
              <td>{formatAngle(left)}</td>
              <td>{formatAngle(right)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
