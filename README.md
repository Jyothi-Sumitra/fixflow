# FixFlow — Local Service Request & Maintenance System

FixFlow is an AI-powered local maintenance and service-request orchestration system. Residents describe maintenance issues in natural language, and a LangGraph state machine powered by Groq classifies the issue, extracts locations and timelines, clarifies missing information through human-in-the-loop interrupts, determines priority, and stores tickets in an administrative operations dashboard.

---

## Architecture Overview

```
                                  +-----------------------------+
                                  |     Resident Complaint      |
                                  |     (Natural Language)      |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  | LangGraph: Classify Node    |
                                  |  (Plumbing, Electrical,...) |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  | LangGraph: Extract Details  |
                                  |   (Location, Duration,...)  |
                                  +--------------+--------------+
                                                 |
                       [Location Missing?]       |       [Location Present]
                   +-----------------------------+-----------------------------+
                   |                                                           |
                   v                                                           v
+-------------------------------------+                       +----------------------------------+
| LangGraph: Interrupt & Clarify      |                       | LangGraph: Determine Priority    |
| (POST /tickets/{thread_id}/resume)  |                       | (Groq Severity & Hazard Reason)  |
+------------------+------------------+                       +----------------+-----------------+
                   |                                                           |
                   +-----------------------------------------------------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  | LangGraph: Create & Save    |
                                  | (SQLite: fixflow.db)        |
                                  +--------------+--------------+
                                                 |
                                                 v
                                  +-----------------------------+
                                  | FixFlow Admin Operations    |
                                  | (Triage, Linear Status)     |
                                  +-----------------------------+
```

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Architecture**: Modular structure (`components/`, `pages/`, `services/`, `context/`, `hooks/`, `layouts/`, `types/`)

### Backend
- **Framework**: FastAPI (Python REST API)
- **Workflow Orchestration**: LangGraph StateGraph with checkpoint interrupts
- **LLM**: Groq (`ChatGroq`)
- **Persistence**: SQLite (Configurable via `DATABASE_PATH`)
- **Server**: Uvicorn ASGI server

---

## LangGraph Workflow & Thread Safety

1. **Initial Submission (`POST /tickets`)**:
   - Generates a unique thread ID (`str(uuid.uuid4())`) for every new complaint to ensure independent checkpoints.
   - The graph runs `classify_issue` and `extract_details`.
   - If the location is missing, the workflow pauses at an interrupt checkpoint and returns:
     ```json
     {
       "status": "needs_information",
       "thread_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
       "question": "Where is the issue located?"
     }
     ```
2. **Resume Submission (`POST /tickets/{thread_id}/resume`)**:
   - Reuses the existing `thread_id` so LangGraph loads the correct checkpoint state.
   - Resumes execution via `Command(resume=answer)` into `determine_priority` and `create_ticket`.
   - Saves the final ticket to SQLite and returns the complete ticket object.

---

## API Endpoints

| Method | Endpoint | Description | Request Body / Query |
|---|---|---|---|
| `GET` | `/tickets` | List tickets with optional filters | Query: `status`, `priority`, `category` |
| `POST` | `/tickets` | Submit new complaint | `{"description": "string"}` |
| `POST` | `/tickets/{thread_id}/resume` | Resume paused complaint workflow | `{"answer": "string"}` |
| `PATCH` | `/tickets/{ticket_id}` | Update ticket resolution status | `{"status": "open" \| "in_progress" \| "resolved"}` |

> **Validation Note**: The `PATCH /tickets/{ticket_id}` endpoint enforces strict status values using Pydantic (`Literal["open", "in_progress", "resolved"]`). Any invalid status (e.g., `"banana"`) will be rejected with `422 Unprocessable Entity`.

---

## Environment Variables

### Backend (`.env` in root)

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | **Yes** | — | Groq API Key for LLM classification and priority reasoning |
| `FRONTEND_URL` | No | `http://localhost:5173,http://localhost:5174` | Allowed frontend origin(s) for CORS (comma-separated, or `*`) |
| `DATABASE_PATH` | No | `fixflow.db` | Filesystem path for the SQLite database file |
| `PORT` | No | `8000` | Port for the ASGI server |

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://127.0.0.1:8000` | Base URL of the backend API (e.g., `https://api.fixflow.com`) |

---

## Local Development Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Groq API Key

### 1. Backend Setup
```bash
# From project root
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend dev server
uvicorn app.api:app --reload --host 127.0.0.1 --port 8000
```
Backend API docs will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
# In another terminal, enter frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend dev server will launch at `http://localhost:5173` or `http://localhost:5174`.

---

## Production Deployment

### Production Start Command
For container platforms, cloud hosts (Render, Railway, Fly.io, Heroku), or a Linux VPS:
```bash
uvicorn app.api:app --host 0.0.0.0 --port ${PORT:-8000}
```

### Frontend Deployment (Vercel, Netlify, Cloudflare Pages)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables:
   - `VITE_API_URL`: Set to your deployed backend URL (e.g. `https://fixflow-api.onrender.com`). Do NOT include trailing slashes.

### Backend Deployment (Render, Railway, Fly.io, VPS)
1. Set Environment Variables:
   - `GROQ_API_KEY`: Your production Groq API key
   - `FRONTEND_URL`: URL of your deployed frontend (e.g. `https://fixflow.vercel.app`)
   - `DATABASE_PATH`: Path to SQLite file (e.g. `/data/fixflow.db` when using a persistent volume)
2. Start Command:
   `uvicorn app.api:app --host 0.0.0.0 --port $PORT`

---

## SQLite Persistence Limitation & Considerations

> [!WARNING]
> **Ephemeral Storage Notice**:
> SQLite stores all ticket data in a local file (`DATABASE_PATH`, defaulting to `fixflow.db`).
> 
> Many modern cloud hosting platforms (such as Render free instances, Heroku, standard container services) operate on **ephemeral filesystems**. On these platforms, any local files created at runtime are destroyed whenever the service restarts, redeploys, or sleeps.
> 
> **To prevent data loss in production:**
> 1. Attach a **Persistent Disk/Volume** (available on Render paid tiers, Railway volumes, Fly.io volumes, or any persistent VPS/VM).
> 2. Set the `DATABASE_PATH` environment variable to point to the mounted persistent directory (for example, `DATABASE_PATH=/data/fixflow.db`).
> 3. If multi-instance horizontal autoscaling is required in the future, migrate the database layer to a managed relational database service (such as PostgreSQL).

---

## Verification & Audit Checklist

- [x] Unique LangGraph Thread IDs generated via `uuid.uuid4()` for every complaint
- [x] Paused interrupts return `thread_id` and resume with the same ID
- [x] CORS origin configurable via `FRONTEND_URL` environment variable
- [x] Frontend API URL configurable via `VITE_API_URL`
- [x] Status updates strictly validated via Pydantic (`open`, `in_progress`, `resolved`), rejecting invalid values with HTTP 422
- [x] Database test code and manual mutations removed
- [x] SQLite database path configurable via `DATABASE_PATH`
- [x] `.env.example` templates created for both backend and frontend
- [x] `.gitignore` updated to safeguard `.env` files and `.db` files
- [x] Zero build errors on `npm run build` (TypeScript + Vite)
