/**
 * Pure geometry helpers for joint-angle calculation.
 *
 * All angles are returned in **degrees** (0–180).
 * A "joint angle" is the interior angle at the middle point (vertex)
 * formed by the segments point_a→vertex and point_c→vertex.
 */

export interface Point {
  x: number
  y: number
  z?: number
}

/**
 * Calculate the angle (in degrees) at the vertex `b` formed by points
 * `a → b → c`.
 *
 * Uses the dot-product / arccos formula:
 *   cos(θ) = (BA · BC) / (|BA| × |BC|)
 *
 * Returns a value in the range [0, 180].
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  const ba = subtract(a, b)
  const bc = subtract(c, b)

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z
  const magBA = magnitude(ba)
  const magBC = magnitude(bc)

  // Guard against zero-length vectors (overlapping points)
  if (magBA === 0 || magBC === 0) return 0

  // Clamp to [-1, 1] to avoid NaN from floating-point drift
  const cosine = Math.max(-1, Math.min(1, dot / (magBA * magBC)))
  const radians = Math.acos(cosine)

  return radians * (180 / Math.PI)
}

/** Subtract point `origin` from point `p`, returning a 3D vector. */
function subtract(p: Point, origin: Point): { x: number; y: number; z: number } {
  return {
    x: p.x - origin.x,
    y: p.y - origin.y,
    z: (p.z ?? 0) - (origin.z ?? 0),
  }
}

/** Euclidean magnitude of a 3D vector. */
function magnitude(v: { x: number; y: number; z: number }): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}
