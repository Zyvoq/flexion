import { describe, it, expect } from 'vitest'
import { getExerciseConfig, EXERCISE_CONFIGS } from '../lib/exercises'
import { detectDeviations } from '../lib/deviations'
import type { JointAngles } from '../hooks/useAngleCalculator'

describe('Exercise Configurations Registry', () => {
  it('loads all 3 exercises with valid schemas', () => {
    expect(EXERCISE_CONFIGS.squat).toBeDefined()
    expect(EXERCISE_CONFIGS.deadlift).toBeDefined()
    expect(EXERCISE_CONFIGS.pushup).toBeDefined()

    expect(getExerciseConfig('squat').exercise).toBe('squat')
    expect(getExerciseConfig('deadlift').exercise).toBe('deadlift')
    expect(getExerciseConfig('pushup').exercise).toBe('pushup')
  })

  it('verifies primaryJoint configuration for each exercise', () => {
    expect(EXERCISE_CONFIGS.squat.phaseTransitions.primaryJoint).toBe('knee')
    expect(EXERCISE_CONFIGS.deadlift.phaseTransitions.primaryJoint).toBe('hip')
    expect(EXERCISE_CONFIGS.pushup.phaseTransitions.primaryJoint).toBe('elbow')
  })
})

describe('Dynamic Deviation Detection Across Exercises', () => {
  const dummyAngles: JointAngles = {
    leftKnee: 170,
    rightKnee: 170,
    leftHip: 170,
    rightHip: 170,
    leftBack: 170,
    rightBack: 170,
    leftElbow: 170,
    rightElbow: 170,
    leftShoulder: 80,
    rightShoulder: 80,
  }

  it('detects squat insufficient depth and valgus collapse', () => {
    const squatAngles: JointAngles = {
      ...dummyAngles,
      leftKnee: 115,
      rightKnee: 95, // valgus difference = 20
    }

    const devs = detectDeviations(squatAngles, 'bottom', 'squat')
    const issueKeys = devs.map((d) => d.issue)

    expect(issueKeys).toContain('insufficient_depth')
    expect(issueKeys).toContain('knee_valgus_collapse')
  })

  it('detects deadlift lumbar flexion and bar path deviation', () => {
    const deadliftAngles: JointAngles = {
      ...dummyAngles,
      leftBack: 110,
      rightBack: 110, // below backAngleMin 120 and 130
    }

    const devs = detectDeviations(deadliftAngles, 'bottom', 'deadlift')
    const issueKeys = devs.map((d) => d.issue)

    expect(issueKeys).toContain('lumbar_flexion')
    expect(issueKeys).toContain('bar_path_deviation')
  })

  it('detects pushup elbow flaring and hip sag', () => {
    const pushupAngles: JointAngles = {
      ...dummyAngles,
      leftElbow: 110,
      rightElbow: 110, // insufficient depth (elbow > 100)
      leftShoulder: 90,
      rightShoulder: 90, // elbow flaring / shoulder abduction (> 85)
      leftHip: 140,
      rightHip: 140, // hip sag (< 155)
    }

    const devs = detectDeviations(pushupAngles, 'bottom', 'pushup')
    const issueKeys = devs.map((d) => d.issue)

    expect(issueKeys).toContain('insufficient_depth')
    expect(issueKeys).toContain('shoulder_abduction')
    expect(issueKeys).toContain('core_alignment')
  })
})
