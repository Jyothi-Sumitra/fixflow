from langgraph.types import Command
from app.graph import graph

if __name__ == "__main__":
    initial_state = {
        "description": "The fan is broken.",
        "category": "",
        "details": "",
        "location": "",
        "duration": "",
        "priority": "",
        "status": "",
        "user_response": ""
    }

    config = {
        "configurable": {
            "thread_id": "ticket-001"
        }
    }

    result = graph.invoke(initial_state, config)

    if "__interrupt__" in result:
        result = graph.invoke(
            Command(resume="Hostel B, Room 204"),
            config
        )

    print(result)