import time
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request
from models.schemas import FeedbackRequest, FeedbackResponse
from services.llm_client import get_correction

router = APIRouter()


class RateLimiter:
    def __init__(self, max_requests: int = 15, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds

        # Clean timestamps older than window
        timestamps = [t for t in self.requests[client_ip] if t > cutoff]
        self.requests[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            return True

        self.requests[client_ip].append(now)
        return False


_rate_limiter = RateLimiter(max_requests=15, window_seconds=60)


@router.post("/feedback", response_model=FeedbackResponse)
async def post_feedback(request: FeedbackRequest, raw_request: Request) -> FeedbackResponse:
    """
    Accept a deviation payload and return a coaching correction based on the requested tier.
    Enforces IP-based rate limiting (15 requests/minute).
    """
    client_ip = raw_request.client.host if raw_request.client else "127.0.0.1"
    if _rate_limiter.is_rate_limited(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a moment before requesting feedback."
        )

    deviations_dicts = [d.model_dump() for d in request.deviations]
    correction = await get_correction(request.exercise, deviations_dicts, tier=request.tier)
    return FeedbackResponse(correction=correction, tier=request.tier)
