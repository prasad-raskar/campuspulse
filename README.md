# CampusPulse - Smart College Notice System

A full-stack application built with React, FastAPI, and PostgreSQL.

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Docker & Docker Compose

## Getting Started

### 1. Database Setup
Start the PostgreSQL database using Docker:
```bash
cd database
docker-compose up -d
```

### 2. Backend Setup
Create a virtual environment and install dependencies:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```
The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Frontend Setup
Install npm packages and run the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at [http://localhost:5173](http://localhost:5173).

## Features
- **Role-based System**: Admin, Faculty, Student roles
- **Notice Board**: Segmented by Class/Branch/Semester
- **Authentication**: JWT-based login (API layer prepared)

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS (v4)
- Backend: FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL
