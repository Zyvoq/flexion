import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

export interface CameraFeedHandle {
  video: HTMLVideoElement | null
}

interface CameraFeedProps {
  onStreamReady: () => void
}

type CameraStatus = 'idle' | 'requesting' | 'streaming' | 'denied' | 'error'

/**
 * Requests webcam permission and renders the live video feed.
 * Exposes the underlying <video> element via a forwarded ref.
 */
const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  function CameraFeed({ onStreamReady }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [status, setStatus] = useState<CameraStatus>('idle')
    const [errorMessage, setErrorMessage] = useState('')
    const [retryCount, setRetryCount] = useState(0)

    useImperativeHandle(ref, () => ({
      get video() {
        return videoRef.current
      },
    }))

    useEffect(() => {
      let stream: MediaStream | null = null
      let cancelled = false

      async function startCamera() {
        setStatus('requesting')

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          })

          // StrictMode unmounts between mounts — bail if already cleaned up
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }

          const video = videoRef.current
          if (!video) return

          video.srcObject = stream
          await video.play()

          if (!cancelled) {
            setStatus('streaming')
            onStreamReady()
          }
        } catch (err) {
          // play() throws AbortError when the video is removed mid-play (StrictMode teardown)
          if (err instanceof DOMException && err.name === 'AbortError') return
          if (cancelled) return

          if (err instanceof DOMException && err.name === 'NotAllowedError') {
            setStatus('denied')
            setErrorMessage(
              'Camera access was denied. Please grant camera permissions in your browser address bar and click Retry.',
            )
          } else {
            setStatus('error')
            setErrorMessage(
              `Could not access camera: ${err instanceof Error ? err.message : 'Unknown camera device error'}`,
            )
          }
        }
      }

      startCamera()

      return () => {
        cancelled = true
        stream?.getTracks().forEach((t) => t.stop())
      }
    }, [onStreamReady, retryCount])

    const handleRetry = () => {
      setRetryCount((c) => c + 1)
    }

    if (status === 'denied' || status === 'error') {
      return (
        <div className="camera-error">
          <div className="camera-error__icon">
            {status === 'denied' ? '🚫' : '⚠️'}
          </div>
          <h2 className="camera-error__title">
            {status === 'denied' ? 'Camera Access Denied' : 'Camera Error'}
          </h2>
          <p className="camera-error__message">{errorMessage}</p>
          <button
            type="button"
            className="exercise-pill exercise-pill--active"
            onClick={handleRetry}
            style={{ marginTop: '0.75rem' }}
          >
            🔄 Retry Camera Connection
          </button>
        </div>
      )
    }

    return (
      <>
        {status === 'requesting' && (
          <div className="camera-loading">
            <div className="camera-loading__spinner" />
            <p className="camera-loading__text">Requesting camera access…</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="camera-video"
          playsInline
          muted
        />
      </>
    )
  },
)

export default CameraFeed
