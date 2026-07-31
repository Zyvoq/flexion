import { useRef, useMemo, useEffect } from 'react'
import type { JointAngles } from './useAngleCalculator'
import { detectDeviations, type FormDeviation } from '../lib/deviations'
import { getExerciseConfig, type ExerciseConfig } from '../lib/exercises'

export type SquatPhase = 'standing' | 'descending' | 'bottom' | 'ascending'

export interface RepState {
  phase: SquatPhase
  repCount: number
  deviations: FormDeviation[]
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Hook that consumes live angle values and tracks exercise phase transitions,
 * incrementing a rep counter on each full cycle based on the active exercise config.
 *
 * Resets state machine on exercise switch.
 */
export function useRepStateMachine(
  angles: JointAngles,
  exerciseConfigInput?: ExerciseConfig | string,
): RepState {
  const exerciseConfig = typeof exerciseConfigInput === 'string'
    ? getExerciseConfig(exerciseConfigInput)
    : (exerciseConfigInput || getExerciseConfig('squat'))

  const phaseRef = useRef<SquatPhase>('standing')
  const repCountRef = useRef(0)
  const bottomDeviationsRef = useRef<FormDeviation[]>([])
  const prevExerciseRef = useRef<string>(exerciseConfig.exercise)

  // Reset state machine if the exercise changes
  useEffect(() => {
    if (prevExerciseRef.current !== exerciseConfig.exercise) {
      console.log(`[Flexion] Exercise switched to ${exerciseConfig.exercise} — resetting rep state machine.`)
      prevExerciseRef.current = exerciseConfig.exercise
      phaseRef.current = 'standing'
      repCountRef.current = 0
      bottomDeviationsRef.current = []
    }
  }, [exerciseConfig.exercise])

  const { primaryJoint = 'knee', standingThreshold, bottomThreshold, hysteresis } = exerciseConfig.phaseTransitions

  return useMemo(() => {
    // Dynamically retrieve primary joint angle from angles map
    const capJoint = capitalize(primaryJoint)
    const leftVal = angles[`left${capJoint}`]
    const rightVal = angles[`right${capJoint}`]

    let primaryAngle: number | null = null
    if (leftVal !== null && rightVal !== null) {
      primaryAngle = (leftVal + rightVal) / 2
    } else {
      primaryAngle = leftVal ?? rightVal
    }

    if (primaryAngle === null) {
      return {
        phase: phaseRef.current,
        repCount: repCountRef.current,
        deviations: [],
      }
    }

    const prevPhase = phaseRef.current

    switch (prevPhase) {
      case 'standing':
        if (primaryAngle < standingThreshold - hysteresis) {
          phaseRef.current = 'descending'
        }
        break

      case 'descending':
        if (primaryAngle < bottomThreshold) {
          phaseRef.current = 'bottom'
          // Check form at the bottom phase
          const devs = detectDeviations(angles, 'bottom', exerciseConfig)
          bottomDeviationsRef.current = devs
          if (devs.length > 0) {
            console.log(`[Flexion] ${exerciseConfig.exercise} form deviations:`, devs)
          }
        } else if (primaryAngle > standingThreshold) {
          // Went back up without reaching bottom — false start
          phaseRef.current = 'standing'
        }
        break

      case 'bottom':
        if (primaryAngle > bottomThreshold + hysteresis) {
          phaseRef.current = 'ascending'
        }
        break

      case 'ascending':
        if (primaryAngle > standingThreshold) {
          phaseRef.current = 'standing'
          repCountRef.current += 1
          console.log(
            `[Flexion] ${exerciseConfig.exercise} Rep #${repCountRef.current} completed`,
            bottomDeviationsRef.current.length > 0
              ? bottomDeviationsRef.current
              : '(clean form)',
          )
          bottomDeviationsRef.current = []
        } else if (primaryAngle < bottomThreshold) {
          // Went back down — partial rep, return to bottom
          phaseRef.current = 'bottom'
        }
        break
    }

    return {
      phase: phaseRef.current,
      repCount: repCountRef.current,
      deviations: bottomDeviationsRef.current,
    }
  }, [angles, exerciseConfig, standingThreshold, bottomThreshold, hysteresis, primaryJoint])
}
