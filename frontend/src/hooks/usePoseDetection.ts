import { useRef, useState, useCallback, useEffect } from 'react'
import {
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

export interface PoseDetectionResult {
  landmarks: NormalizedLandmark[]
  isDetecting: boolean
}

/**
 * Custom hook that wraps MediaPipe Pose Landmarker.
 * Accepts a running HTMLVideoElement and returns the current-frame landmarks
 * plus an `isDetecting` boolean.
 */
export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isStreaming: boolean,
): PoseDetectionResult {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[]>([])
  const [isDetecting, setIsDetecting] = useState(false)

  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const rafIdRef = useRef<number>(0)
  const lastTimestampRef = useRef<number>(-1)

  /* ── Initialise the landmarker once ─────────────────────────────── */
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    )

    landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numPoses: 1,
    })
  }, [])

  /* ── Per-frame detection loop ───────────────────────────────────── */
  const detect = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current

    if (!video || !landmarker || video.readyState < 2) {
      rafIdRef.current = requestAnimationFrame(detect)
      return
    }

    const now = performance.now()
    // MediaPipe requires strictly increasing timestamps
    if (now <= lastTimestampRef.current) {
      rafIdRef.current = requestAnimationFrame(detect)
      return
    }
    lastTimestampRef.current = now

    const result = landmarker.detectForVideo(video, now)
    const poseLandmarks = result.landmarks[0] ?? []
    setLandmarks(poseLandmarks)
    setIsDetecting(poseLandmarks.length > 0)

    rafIdRef.current = requestAnimationFrame(detect)
  }, [videoRef])

  /* ── Start / stop based on streaming state ──────────────────────── */
  useEffect(() => {
    if (!isStreaming) return

    let cancelled = false

    initLandmarker().then(() => {
      if (!cancelled) {
        rafIdRef.current = requestAnimationFrame(detect)
      }
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafIdRef.current)
    }
  }, [isStreaming, initLandmarker, detect])

  /* ── Cleanup landmarker on unmount ──────────────────────────────── */
  useEffect(() => {
    return () => {
      landmarkerRef.current?.close()
      landmarkerRef.current = null
    }
  }, [])

  return { landmarks, isDetecting }
}
