from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DB_NAME = "anon_qa.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            question TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            answer TEXT NOT NULL,
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

class QuestionCreate(BaseModel):
    username: str
    question: str

class AnswerCreate(BaseModel):
    answer: str

class Question(BaseModel):
    id: int
    username: str
    question: str
    answers: List[str] = []

@app.post("/questions/", response_model=Question)
async def create_question(question: QuestionCreate):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO questions (username, question) VALUES (?, ?)", 
                   (question.username, question.question))
    question_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return Question(id=question_id, username=question.username, question=question.question)

@app.get("/questions/", response_model=List[Question])
async def get_questions():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM questions")
    questions = cursor.fetchall()
    result = []
    for q in questions:
        question_id, username, question_text = q
        cursor.execute("SELECT answer FROM answers WHERE question_id = ?", (question_id,))
        answers = [row[0] for row in cursor.fetchall()]
        result.append(Question(id=question_id, username=username, question=question_text, answers=answers))
    conn.close()
    return result

@app.post("/questions/{question_id}/answers/", response_model=dict)
async def create_answer(question_id: int, answer: AnswerCreate):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM questions WHERE id = ?", (question_id,))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Question not found")
    cursor.execute("INSERT INTO answers (question_id, answer) VALUES (?, ?)", 
                   (question_id, answer.answer))
    conn.commit()
    conn.close()
    return {"message": "Answer added", "question_id": question_id, "answer": answer.answer}

@app.get("/questions/{username}/", response_model=List[Question])
async def get_questions_by_username(username: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM questions WHERE username = ?", (username,))
    questions = cursor.fetchall()
    result = []
    for q in questions:
        question_id, username, question_text = q
        cursor.execute("SELECT answer FROM answers WHERE question_id = ?", (question_id,))
        answers = [row[0] for row in cursor.fetchall()]
        result.append(Question(id=question_id, username=username, question=question_text, answers=answers))
    conn.close()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
