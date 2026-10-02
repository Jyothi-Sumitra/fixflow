from app.state import TicketState, ComplaintDetails, PriorityResult
from app.llm import llm
from langgraph.types import interrupt
from app.database import save_ticket

structured_llm = llm.with_structured_output(ComplaintDetails)
priority_llm = llm.with_structured_output(PriorityResult)


def classify_complaint(state: TicketState):
    complaint = state["description"]

    prompt = f"""
    Classify this maintenance complaint into exactly one category:

    plumbing
    electrical
    network
    cleaning
    other

    Complaint:
    {complaint}

    Return only the category name.
    """

    response = llm.invoke(prompt)

    return {
        "category": response.content.strip()
    }

def extract_details(state: TicketState):
    complaint = state["description"]

    prompt = f"""
    Extract the following information from this maintenance complaint:

    - location
    - duration
    - details

    If a piece of information is not present, return an empty string.

    Complaint:
    {complaint}
    """

    response = structured_llm.invoke(prompt)

    return {
        "location": response.location,
        "duration": response.duration,
        "details": response.details
    }

def determine_priority(state: TicketState):
    complaint = state["description"]

    prompt = f"""
    Determine the priority of this maintenance complaint.

    Choose exactly one:
    low
    medium
    high

    Also explain briefly why you selected that priority.

    Complaint:
    {complaint}
    """

    response = priority_llm.invoke(prompt)

    return {
        "priority": response.priority,
        "priority_reason": response.reason
    }

def check_missing_information(state: TicketState):
    if not state["location"]:
        return "missing"
    return "complete"

def ask_for_information(state: TicketState):
    answer = interrupt("Where is the issue located?")
    return{
        "location":answer,
        "status":"information_received"
    }

def create_ticket(state: TicketState):
    return {
        "status": "open"
    }

def save_ticket_node(state: TicketState):
    save_ticket(state)

    return {}