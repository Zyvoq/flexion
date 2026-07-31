import { describe, it, expect } from 'vitest'
import { calculateAngle, type Point } from '../lib/angles'

/**
 * Unit tests for calculateAngle using known geometric fixtures.
 * All expected angles are in degrees.
 */
describe('calculateAngle', () => {
  it('returns 90° for a right angle (2D)', () => {
    const a: Point = { x: 1, y: 0 }
    const b: Point = { x: 0, y: 0 } // vertex
    const c: Point = { x: 0, y: 1 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5)
  })

  it('returns 180° for a straight line', () => {
    const a: Point = { x: -1, y: 0 }
    const b: Point = { x: 0, y: 0 }
    const c: Point = { x: 1, y: 0 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5)
  })

  it('returns 0° for overlapping rays (same direction)', () => {
    const a: Point = { x: 2, y: 0 }
    const b: Point = { x: 0, y: 0 }
    const c: Point = { x: 3, y: 0 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(0, 5)
  })

  it('returns 60° for an equilateral triangle vertex', () => {
    const a: Point = { x: 1, y: 0 }
    const b: Point = { x: 0, y: 0 }
    const c: Point = { x: 0.5, y: Math.sqrt(3) / 2 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(60, 5)
  })

  it('returns 45° correctly', () => {
    const a: Point = { x: 1, y: 0 }
    const b: Point = { x: 0, y: 0 }
    const c: Point = { x: 1, y: 1 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(45, 5)
  })

  it('works with 3D coordinates', () => {
    const a: Point = { x: 1, y: 0, z: 0 }
    const b: Point = { x: 0, y: 0, z: 0 }
    const c: Point = { x: 0, y: 0, z: 1 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5)
  })

  it('works with non-origin vertex', () => {
    // Right angle at (5, 5)
    const a: Point = { x: 6, y: 5 }
    const b: Point = { x: 5, y: 5 }
    const c: Point = { x: 5, y: 6 }
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5)
  })

  it('returns 0 when two points overlap (zero-length vector)', () => {
    const a: Point = { x: 1, y: 1 }
    const b: Point = { x: 1, y: 1 } // same as a
    const c: Point = { x: 2, y: 2 }
    expect(calculateAngle(a, b, c)).toBe(0)
  })

  it('handles realistic squat-like knee angle (~90°)', () => {
    // Simulating: hip above and behind knee, ankle below and in front
    const hip: Point = { x: 0.4, y: 0.4 }
    const knee: Point = { x: 0.45, y: 0.6 }
    const ankle: Point = { x: 0.45, y: 0.85 }
    const angle = calculateAngle(hip, knee, ankle)
    // Should be close to straight (~170°) since hip-knee-ankle are nearly collinear
    expect(angle).toBeGreaterThan(150)
    expect(angle).toBeLessThan(180)
  })

  it('handles a deep squat knee angle', () => {
    // Hip is well behind the knee, ankle is below — creating a sharper angle
    const hip: Point = { x: 0.3, y: 0.45 }
    const knee: Point = { x: 0.5, y: 0.65 }
    const ankle: Point = { x: 0.5, y: 0.9 }
    const angle = calculateAngle(hip, knee, ankle)
    expect(angle).toBeGreaterThan(100)
    expect(angle).toBeLessThan(160)
  })
})
