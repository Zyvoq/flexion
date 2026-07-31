import type { JointAngles } from '../hooks/useAngleCalculator'
import { getExerciseConfig, type ExerciseConfig } from './exercises'

export type Severity = 'mild' | 'moderate' | 'severe'

export interface FormDeviation {
  joint: string
  issue: string
  severity: Severity
  phase: string
  detail: string
}

/**
 * Check for form deviations dynamically against the current exercise configuration
 * at the relevant biomechanical phase.
 */
export function detectDeviations(
  angles: JointAngles,
  currentPhase: string,
  exerciseConfigInput?: ExerciseConfig | string,
): FormDeviation[] {
  const exerciseConfig = typeof exerciseConfigInput === 'string'
    ? getExerciseConfig(exerciseConfigInput)
    : (exerciseConfigInput || getExerciseConfig('squat'))

  const deviations: FormDeviation[] = []
  const rules = exerciseConfig.deviations || {}

  for (const [issueKey, rule] of Object.entries(rules)) {
    if (currentPhase !== rule.checkPhase) continue

    // 1. Knee valgus collapse (bilateral difference)
    if (rule.kneeAngleDiffThreshold !== undefined) {
      const leftKnee = angles.leftKnee
      const rightKnee = angles.rightKnee
      if (leftKnee !== null && rightKnee !== null) {
        const diff = Math.abs(leftKnee - rightKnee)
        if (diff > rule.kneeAngleDiffThreshold) {
          const severity = classifySeverity(diff, rule.kneeAngleDiffThreshold, 25, 35)
          deviations.push({
            joint: 'knee',
            issue: issueKey,
            severity,
            phase: currentPhase,
            detail: `Left/right knee angle difference: ${Math.round(diff)}° (threshold: ${rule.kneeAngleDiffThreshold}°)`,
          })
        }
      }
    }

    // 2. Back angle min rules (excessive forward lean, lumbar flexion, bar path deviation)
    if (rule.backAngleMin !== undefined) {
      const backAngle = avgNonNull(angles.leftBack, angles.rightBack)
      if (backAngle !== null && backAngle < rule.backAngleMin) {
        const overshoot = rule.backAngleMin - backAngle
        const severity = classifySeverity(overshoot, 5, 15, 30)
        deviations.push({
          joint: 'back',
          issue: issueKey,
          severity,
          phase: currentPhase,
          detail: `Back angle: ${Math.round(backAngle)}° (min: ${rule.backAngleMin}°)`,
        })
      }
    }

    // 3. Knee angle max rules (insufficient squat depth, knee hyperextension)
    if (rule.kneeAngleMax !== undefined) {
      const kneeAngle = avgNonNull(angles.leftKnee, angles.rightKnee)
      if (kneeAngle !== null && kneeAngle > rule.kneeAngleMax) {
        const overshoot = kneeAngle - rule.kneeAngleMax
        const severity = classifySeverity(overshoot, 5, 15, 30)
        deviations.push({
          joint: 'knee',
          issue: issueKey,
          severity,
          phase: currentPhase,
          detail: `Knee angle: ${Math.round(kneeAngle)}° (max: ${rule.kneeAngleMax}°)`,
        })
      }
    }

    // 4. Elbow angle max rules (insufficient pushup depth)
    if (rule.elbowAngleMax !== undefined) {
      const elbowAngle = avgNonNull(angles.leftElbow, angles.rightElbow)
      if (elbowAngle !== null && elbowAngle > rule.elbowAngleMax) {
        const overshoot = elbowAngle - rule.elbowAngleMax
        const severity = classifySeverity(overshoot, 5, 15, 30)
        deviations.push({
          joint: 'elbow',
          issue: issueKey,
          severity,
          phase: currentPhase,
          detail: `Elbow angle: ${Math.round(elbowAngle)}° (max for depth: ${rule.elbowAngleMax}°)`,
        })
      }
    }

    // 5. Shoulder angle max rules (elbow flaring / shoulder abduction)
    if (rule.shoulderAngleMax !== undefined) {
      const shoulderAngle = avgNonNull(angles.leftShoulder, angles.rightShoulder)
      if (shoulderAngle !== null && shoulderAngle > rule.shoulderAngleMax) {
        const overshoot = shoulderAngle - rule.shoulderAngleMax
        const severity = classifySeverity(overshoot, 5, 15, 30)
        deviations.push({
          joint: 'shoulder',
          issue: issueKey,
          severity,
          phase: currentPhase,
          detail: `Shoulder angle: ${Math.round(shoulderAngle)}° (max alignment: ${rule.shoulderAngleMax}°)`,
        })
      }
    }

    // 6. Hip angle min rules (pushup hip sag / core alignment)
    if (rule.hipAngleMin !== undefined) {
      const hipAngle = avgNonNull(angles.leftHip, angles.rightHip)
      if (hipAngle !== null && hipAngle < rule.hipAngleMin) {
        const overshoot = rule.hipAngleMin - hipAngle
        const severity = classifySeverity(overshoot, 5, 15, 30)
        deviations.push({
          joint: 'hip',
          issue: issueKey,
          severity,
          phase: currentPhase,
          detail: `Hip plank angle: ${Math.round(hipAngle)}° (min: ${rule.hipAngleMin}°)`,
        })
      }
    }
  }

  return deviations
}

/** Classify severity based on how far a value exceeds thresholds. */
function classifySeverity(
  value: number,
  mildThreshold: number,
  moderateThreshold: number,
  severeThreshold: number,
): Severity {
  if (value >= severeThreshold) return 'severe'
  if (value >= moderateThreshold) return 'moderate'
  if (value >= mildThreshold) return 'mild'
  return 'mild'
}

/** Average of two nullable values; returns null if both are null. */
function avgNonNull(a: number | null, b: number | null): number | null {
  if (a !== null && b !== null) return (a + b) / 2
  return a ?? b
}
