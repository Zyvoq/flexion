import { useMemo } from 'react'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { calculateAngle } from '../lib/angles'
import { getExerciseConfig, type ExerciseConfig } from '../lib/exercises'
import {
  NOSE,
  LEFT_SHOULDER, RIGHT_SHOULDER,
  LEFT_ELBOW, RIGHT_ELBOW,
  LEFT_WRIST, RIGHT_WRIST,
  LEFT_HIP, RIGHT_HIP,
  LEFT_KNEE, RIGHT_KNEE,
  LEFT_ANKLE, RIGHT_ANKLE,
  LEFT_EAR, RIGHT_EAR,
} from '../lib/landmarks'

export interface JointAngles {
  leftKnee: number | null
  rightKnee: number | null
  leftHip: number | null
  rightHip: number | null
  leftBack: number | null
  rightBack: number | null
  leftElbow: number | null
  rightElbow: number | null
  leftShoulder: number | null
  rightShoulder: number | null
  [key: string]: number | null
}

export type SquatAngles = JointAngles

const LANDMARK_INDICES: Record<string, { left: number; right: number }> = {
  nose: { left: NOSE, right: NOSE },
  ear: { left: LEFT_EAR, right: RIGHT_EAR },
  shoulder: { left: LEFT_SHOULDER, right: RIGHT_SHOULDER },
  elbow: { left: LEFT_ELBOW, right: RIGHT_ELBOW },
  wrist: { left: LEFT_WRIST, right: RIGHT_WRIST },
  hip: { left: LEFT_HIP, right: RIGHT_HIP },
  knee: { left: LEFT_KNEE, right: RIGHT_KNEE },
  ankle: { left: LEFT_ANKLE, right: RIGHT_ANKLE },
}

const EMPTY_ANGLES: JointAngles = {
  leftKnee: null,
  rightKnee: null,
  leftHip: null,
  rightHip: null,
  leftBack: null,
  rightBack: null,
  leftElbow: null,
  rightElbow: null,
  leftShoulder: null,
  rightShoulder: null,
}

/**
 * Safely compute the angle at the vertex (middle landmark).
 * Returns null if any of the three landmarks are missing or poorly visible.
 */
function safeAngle(
  landmarks: NormalizedLandmark[],
  a: number,
  b: number,
  c: number,
  visibilityThreshold = 0.5,
): number | null {
  const la = landmarks[a]
  const lb = landmarks[b]
  const lc = landmarks[c]
  if (!la || !lb || !lc) return null
  if (
    (la.visibility ?? 0) < visibilityThreshold ||
    (lb.visibility ?? 0) < visibilityThreshold ||
    (lc.visibility ?? 0) < visibilityThreshold
  ) {
    return null
  }
  return calculateAngle(la, lb, lc)
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Hook that computes exercise joint angles dynamically based on the exercise configuration.
 *
 * Defaults to 'squat' configuration if exercise is not provided or specified.
 */
export function useAngleCalculator(
  landmarks: NormalizedLandmark[],
  exerciseConfigInput?: ExerciseConfig | string,
): JointAngles {
  const exerciseConfig = typeof exerciseConfigInput === 'string'
    ? getExerciseConfig(exerciseConfigInput)
    : (exerciseConfigInput || getExerciseConfig('squat'))

  return useMemo(() => {
    if (landmarks.length === 0) return EMPTY_ANGLES

    const result: JointAngles = { ...EMPTY_ANGLES }

    for (const [jointName, jointDef] of Object.entries(exerciseConfig.joints)) {
      const [nameA, nameB, nameC] = jointDef.landmarks
      const idxA = LANDMARK_INDICES[nameA]
      const idxB = LANDMARK_INDICES[nameB]
      const idxC = LANDMARK_INDICES[nameC]

      if (idxA && idxB && idxC) {
        const leftVal = safeAngle(landmarks, idxA.left, idxB.left, idxC.left)
        const rightVal = safeAngle(landmarks, idxA.right, idxB.right, idxC.right)

        const capName = capitalize(jointName)
        result[`left${capName}`] = leftVal
        result[`right${capName}`] = rightVal
      }
    }

    return result
  }, [landmarks, exerciseConfig])
}
