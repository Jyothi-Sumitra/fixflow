import os
import uuid
from typing import Literal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.database import get_tickets, update_ticket_status
from app.graph import graph
from langgraph.types import Command

app = FastAPI(
    title="FixFlow API",
    description="AI-powered local maintenance ticket management system",
    version="1.0.0"
)

# CORS configuration
# Configurable via FRONTEND_URL (can be a comma-separated list of origins)
frontend_url_env = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if frontend_url_env:
    if frontend_url_env == "*":
        allowed_origins = ["*"]
    else:
        for origin in frontend_url_env.split(","):
            origin = origin.strip()
            if origin and origin not in allowed_origins:
                allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if allowed_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TicketRequest(BaseModel):
    description: str = Field(..., min_length=1, description="Description of the maintenance issue")

class ResumeRequest(BaseModel):
    answer: str = Field(..., min_length=1, description="Clarification answer provided by the user")

class StatusUpdate(BaseModel):
    status: Literal["open", "in_progress", "resolved"]

@app.get("/tickets")
def read_tickets(
    status: str | None = None,
    priority: str | None = None,
    category: str | None = None
):
    tickets = get_tickets(
        status=status,
        priority=priority,
        category=category
    )

    return {
        "tickets": tickets
    }

@app.post("/tickets")
def create_ticket_endpoint(ticket: TicketRequest):
    thread_id = str(uuid.uuid4())
    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    initial_state = {
        "description": ticket.description.strip(),
        "category": "",
        "details": "",
        "location": "",
        "duration": "",
        "priority": "",
        "status": "",
        "user_response": "",
        "priority_reason": ""
    }

    result = graph.invoke(initial_state, config)

    if "__interrupt__" in result:
        return {
            "status": "needs_information",
            "thread_id": thread_id,
            "question": result["__interrupt__"][0].value
        }

    return result

@app.post("/tickets/{thread_id}/resume")
def resume_ticket(thread_id: str, request: ResumeRequest):
    config = {
        "configurable": {
            "thread_id": thread_id
        }
    }

    result = graph.invoke(
        Command(resume=request.answer.strip()),
        config
    )

    return result

@app.patch("/tickets/{ticket_id}")
def update_ticket(ticket_id: int, request: StatusUpdate):
    update_ticket_status(
        ticket_id,
        request.status
    )

    return {
        "message": "Ticket status updated",
        "ticket_id": ticket_id,
        "status": request.status
    }