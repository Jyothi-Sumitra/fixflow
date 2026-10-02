from langgraph.graph import StateGraph, START, END
from app.state import TicketState
from app.nodes import classify_complaint, extract_details, determine_priority, check_missing_information, ask_for_information, create_ticket, save_ticket_node
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

builder = StateGraph(TicketState)
checkpoint = InMemorySaver()

builder.add_node("classify_complaint", classify_complaint)
builder.add_node("extract_details", extract_details)
builder.add_node("determine_priority", determine_priority)
builder.add_node("ask_for_information", ask_for_information)
builder.add_node("create_ticket", create_ticket)
builder.add_node("save_ticket", save_ticket_node)

builder.add_edge(START, "classify_complaint")
builder.add_edge("classify_complaint", "extract_details")
builder.add_conditional_edges(
                                "extract_details",check_missing_information,
                                {
                                    "missing": "ask_for_information",
                                    "complete": "determine_priority"
                                }
                            )
builder.add_edge("ask_for_information", "determine_priority")
builder.add_edge("determine_priority", "create_ticket")
builder.add_edge("create_ticket", "save_ticket")
builder.add_edge("save_ticket", END)

graph = builder.compile(checkpointer=checkpoint)