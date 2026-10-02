# FixFlow 🧰

### AI-Powered Local Service Request & Resolution System

FixFlow is an AI-powered service desk system that converts natural-language maintenance complaints into structured, trackable service tickets.

It uses LangGraph to classify complaints, extract relevant details, identify missing information through human-in-the-loop interaction, determine priority, and manage ticket resolution.

---

## Features

- 🤖 AI-based complaint classification
- 📋 Automatic extraction of location, duration, and issue details
- 💬 Human-in-the-loop information collection
- 🚨 AI-powered priority determination with reasoning
- 🎫 Ticket creation and status management
- 🔎 Search and filtering for service tickets
- 🗄️ SQLite-based ticket persistence
- 🌐 REST API with FastAPI
- 🖥️ React-based service desk dashboard

---

## Workflow

```text
User Complaint
      ↓
Classify Complaint
      ↓
Extract Details
      ↓
Check Missing Information
      ↓
Human Input (if required)
      ↓
Determine Priority
      ↓
Create Ticket
      ↓
Save to Database
```

---

## Tech Stack

### Backend

- Python
- LangGraph
- LangChain
- Groq
- FastAPI
- SQLite

### Frontend

- React
- Vite
- Tailwind CSS

---

## Architecture

```text
React Frontend
      ↓
FastAPI
      ↓
LangGraph Workflow
      ↓
Groq LLM
      ↓
SQLite Database
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/tickets` | Retrieve tickets |
| POST | `/tickets` | Create a ticket |
| POST | `/tickets/{thread_id}/resume` | Resume an interrupted workflow |
| PATCH | `/tickets/{ticket_id}` | Update ticket status |

---

## Project Structure

```text
fixflow/
├── app/
│   ├── __init__.py
│   ├── state.py
│   ├── llm.py
│   ├── nodes.py
│   ├── graph.py
│   ├── database.py
│   ├── api.py
│   └── main.py
│
├── frontend/
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/fixflow.git
cd fixflow
```

### 2. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
DATABASE_PATH=fixflow.db
FRONTEND_URL=http://localhost:5173
```

### 4. Start the backend

```bash
uvicorn app.api:app --reload
```

### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Key Concept

FixFlow separates **LLM reasoning** from **application workflow**.

The LLM handles natural-language understanding, classification, information extraction, and priority determination.

LangGraph manages state, workflow routing, conditional logic, human-in-the-loop interaction, and execution flow.

FastAPI provides the backend API, while SQLite handles ticket persistence.

---

## Example

### User Input

```text
The electrical socket is producing sparks in Hostel B, Room 204.
```

### AI-Generated Ticket

```text
Category: Electrical
Location: Hostel B, Room 204
Priority: High
Status: Open
```

The system can also pause the workflow when required information is missing and resume it after receiving the user's response.

---

## Future Improvements

- PostgreSQL-based production persistence
- Authentication and role-based access
- Duplicate complaint detection
- Ticket history and analytics
- Email and notification integration

---

## License

This project is developed for educational and portfolio purposes.
