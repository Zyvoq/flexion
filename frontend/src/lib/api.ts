import type { FormDeviation } from './deviations'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export type FeedbackTier = 'beginner' | 'advanced'

export interface FeedbackResponse {
  correction: string
  tier: FeedbackTier
}

/**
 * Send deviations to the backend and receive a coaching correction.
 */
export async function fetchFeedback(
  exercise: string,
  deviations: FormDeviation[],
  tier: FeedbackTier = 'beginner',
): Promise<FeedbackResponse> {
  const resp = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercise, deviations, tier }),
  })

  if (resp.status === 429) {
    throw new Error('Rate limit reached. Please wait a moment before requesting more feedback.')
  }

  if (!resp.ok) {
    throw new Error(`Feedback API error (${resp.status}): Unable to connect to coaching server`)
  }

  return resp.json() as Promise<FeedbackResponse>
}
