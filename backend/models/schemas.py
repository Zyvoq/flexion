from pydantic import BaseModel
from typing import Literal


class FormDeviation(BaseModel):
    joint: str
    issue: str
    severity: Literal["mild", "moderate", "severe"]
    phase: str
    detail: str


class FeedbackRequest(BaseModel):
    exercise: str
    deviations: list[FormDeviation]
    tier: Literal["beginner", "advanced"] = "beginner"


class FeedbackResponse(BaseModel):
    correction: str
    tier: str = "beginner"
