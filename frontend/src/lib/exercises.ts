import squat from '../data/exercises/squat.json'
import deadlift from '../data/exercises/deadlift.json'
import pushup from '../data/exercises/pushup.json'

export interface JointPhaseConfig {
  min: number
  max: number
  label: string
}

export interface JointConfig {
  landmarks: [string, string, string]
  phases: {
    top: JointPhaseConfig
    bottom: JointPhaseConfig
  }
  unit: string
}

export interface PhaseTransitionsConfig {
  primaryJoint?: string
  standingThreshold: number
  bottomThreshold: number
  hysteresis: number
}

export interface DeviationRule {
  checkPhase: string
  description: string
  kneeAngleDiffThreshold?: number
  backAngleMin?: number
  kneeAngleMax?: number
  elbowAngleMax?: number
  shoulderAngleMax?: number
  hipAngleMin?: number
}

export interface ExerciseConfig {
  exercise: string
  description: string
  joints: Record<string, JointConfig>
  phaseTransitions: PhaseTransitionsConfig
  deviations: Record<string, DeviationRule>
}

export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  squat: squat as unknown as ExerciseConfig,
  deadlift: deadlift as unknown as ExerciseConfig,
  pushup: pushup as unknown as ExerciseConfig,
}

export function getExerciseConfig(exerciseName: string): ExerciseConfig {
  return EXERCISE_CONFIGS[exerciseName] || EXERCISE_CONFIGS.squat
}
