import { useState, useEffect, useRef } from 'react'
import type { FormDeviation } from '../lib/deviations'
import { fetchFeedback, type FeedbackTier } from '../lib/api'

export interface FeedbackState {
  correction: string | null
  tier: FeedbackTier
  apiError: string | null
}

/**
 * Hook that sends deviation data to the backend for LLM coaching feedback.
 *
 * Debounce strategy: only fires once per new set of deviations (compared by
 * reference). A cooldown prevents re-triggering within the same rep cycle.
 */
export function useFeedback(
  deviations: FormDeviation[],
  exercise: string = 'squat',
  tier: FeedbackTier = 'beginner',
): FeedbackState {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    correction: null,
    tier,
    apiError: null,
  })
  const lastSentRef = useRef<string>('')
  const cooldownRef = useRef(false)

  useEffect(() => {
    if (deviations.length === 0) return
    if (cooldownRef.current) return

    // Build a fingerprint to avoid sending the exact same deviations twice for same tier
    const fingerprint = `${tier}:${exercise}:` + deviations
      .map((d) => `${d.joint}:${d.issue}:${d.severity}`)
      .sort()
      .join('|')

    if (fingerprint === lastSentRef.current) return
    lastSentRef.current = fingerprint

    // Enforce cooldown — one call per 3 seconds max
    cooldownRef.current = true
    const cooldownTimer = setTimeout(() => {
      cooldownRef.current = false
    }, 3000)

    let cancelled = false

    fetchFeedback(exercise, deviations, tier)
      .then((res) => {
        if (!cancelled) {
          setFeedbackState({
            correction: res.correction,
            tier: res.tier || tier,
            apiError: null,
          })
          console.log(`[Flexion] LLM correction (${res.tier}):`, res.correction)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Backend service unreachable'
          console.warn('[Flexion] Feedback fetch failed:', msg)
          setFeedbackState((prev) => ({
            ...prev,
            apiError: msg,
          }))
        }
      })

    return () => {
      cancelled = true
      clearTimeout(cooldownTimer)
    }
  }, [deviations, exercise, tier])

  return feedbackState
}
