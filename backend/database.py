import sqlite3
import os
from datetime import datetime

DB_PATH = os.getenv("DATABASE_PATH", "fieldnerve.db")

def get_db_connection():
    """Create a database connection with dictionary-like row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite tables for FieldNerve if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Farmers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS farmers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        village TEXT,
        state TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Questions & Answers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS qa_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        language TEXT DEFAULT 'hi',
        source TEXT DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Image Analysis table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS image_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER,
        image_filename TEXT NOT NULL,
        crop TEXT,
        problem TEXT,
        health_status TEXT,
        confidence TEXT,
        possible_causes TEXT,
        recommendations TEXT,
        prevention TEXT,
        warning TEXT,
        language TEXT DEFAULT 'hi',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 4. Expert Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expert_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_code TEXT UNIQUE,
        farmer_name TEXT,
        phone TEXT NOT NULL,
        location TEXT,
        crop_name TEXT,
        problem_description TEXT NOT NULL,
        urgency TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'Assigned to KVK',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("🌾 SQLite database initialized successfully at", DB_PATH)

if __name__ == "__main__":
    init_db()
