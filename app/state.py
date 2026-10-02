from typing import TypedDict
from pydantic import BaseModel

class TicketState(TypedDict):
    description: str
    category: str
    location: str
    duration: str
    priority: str
    status: str
    user_response: str
    priority_reason: str

class ComplaintDetails(BaseModel):
    location: str
    duration: str
    details: str

class PriorityResult(BaseModel):
    priority: str
    reason: str