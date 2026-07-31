import { useRef, useEffect } from 'react'
import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

/**
 * Skeleton connections based on the MediaPipe Pose 33-point model.
 * Each pair [a, b] is a bone connecting landmark index a → b.
 * Reference: docs/landmark_reference.md
 */
const SKELETON_CONNECTIONS: [number, number][] = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7],   // nose → left eye → left ear
  [0, 4], [4, 5], [5, 6], [6, 8],   // nose → right eye → right ear
  [9, 10],                            // mouth

  // Torso
  [11, 12],                           // shoulders
  [11, 23], [12, 24],                 // shoulders → hips
  [23, 24],                           // hips

  // Left arm
  [11, 13], [13, 15],                 // shoulder → elbow → wrist
  [15, 17], [15, 19], [15, 21],       // wrist → pinky / index / thumb
  [17, 19],                           // pinky → index

  // Right arm
  [12, 14], [14, 16],                 // shoulder → elbow → wrist
  [16, 18], [16, 20], [16, 22],       // wrist → pinky / index / thumb
  [18, 20],                           // pinky → index

  // Left leg
  [23, 25], [25, 27],                 // hip → knee → ankle
  [27, 29], [27, 31], [29, 31],       // ankle → heel → foot index

  // Right leg
  [24, 26], [26, 28],                 // hip → knee → ankle
  [28, 30], [28, 32], [30, 32],       // ankle → heel → foot index
]

/** Minimum visibility score to draw a landmark / connection. */
const VISIBILITY_THRESHOLD = 0.5

const LANDMARK_RADIUS = 5
const LANDMARK_COLOR = '#C6FF3D'
const LINE_COLOR = 'rgba(198, 255, 61, 0.65)'
const LINE_WIDTH = 3

interface PoseOverlayProps {
  landmarks: NormalizedLandmark[]
  width: number
  height: number
}

/**
 * Canvas layered over the camera video that draws the 33 landmarks
 * and connecting skeleton lines in real time.
 */
export default function PoseOverlay({ landmarks, width, height }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)
    if (landmarks.length === 0) return

    /* ── Draw skeleton lines ──────────────────────────────────────── */
    ctx.strokeStyle = LINE_COLOR
    ctx.lineWidth = LINE_WIDTH
    ctx.lineCap = 'round'

    for (const [a, b] of SKELETON_CONNECTIONS) {
      const from = landmarks[a]
      const to = landmarks[b]
      if (!from || !to) continue
      if ((from.visibility ?? 0) < VISIBILITY_THRESHOLD) continue
      if ((to.visibility ?? 0) < VISIBILITY_THRESHOLD) continue

      ctx.beginPath()
      ctx.moveTo(from.x * width, from.y * height)
      ctx.lineTo(to.x * width, to.y * height)
      ctx.stroke()
    }

    /* ── Draw landmark dots ───────────────────────────────────────── */
    ctx.fillStyle = LANDMARK_COLOR
    ctx.shadowColor = LANDMARK_COLOR
    ctx.shadowBlur = 6

    for (const lm of landmarks) {
      if ((lm.visibility ?? 0) < VISIBILITY_THRESHOLD) continue

      ctx.beginPath()
      ctx.arc(lm.x * width, lm.y * height, LANDMARK_RADIUS, 0, 2 * Math.PI)
      ctx.fill()
    }

    ctx.shadowBlur = 0
  }, [landmarks, width, height])

  return (
    <canvas
      ref={canvasRef}
      className="pose-canvas"
      width={width}
      height={height}
    />
  )
}
