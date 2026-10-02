import os
import sqlite3

DATABASE_PATH = os.environ.get("DATABASE_PATH", "fixflow.db")

connection = sqlite3.connect(DATABASE_PATH, check_same_thread=False)

cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    category TEXT,
    location TEXT,
    duration TEXT,
    priority TEXT,
    priority_reason TEXT,
    status TEXT
)
""")

connection.commit()

def save_ticket(state):
    cursor.execute("""
    INSERT INTO tickets (
        description,
        category,
        location,
        duration,
        priority,
        priority_reason,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        state["description"],
        state["category"],
        state["location"],
        state["duration"],
        state["priority"],
        state["priority_reason"],
        state["status"]
    ))

    connection.commit()

def get_tickets(status=None, priority=None, category=None):
    query = """
    SELECT
        id,
        description,
        category,
        location,
        duration,
        priority,
        priority_reason,
        status
        FROM tickets
        """

    conditions = []
    values = []

    if status:
        conditions.append("status = ?")
        values.append(status)

    if priority:
        conditions.append("priority = ?")
        values.append(priority)

    if category:
        conditions.append("category = ?")
        values.append(category)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY id DESC"

    cursor.execute(query, values)

    return cursor.fetchall()

def update_ticket_status(ticket_id, status):
    cursor.execute("""
    UPDATE tickets
    SET status = ?
    WHERE id = ?
    """, (status, ticket_id))

    connection.commit()