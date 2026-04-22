# Solid Tech Backend (FastAPI)

This backend implements the API contract used by the frontend mock layer.
Storage uses Supabase Postgres.

## Supabase Setup

1. Create a Supabase project.
2. Copy the Postgres connection string from Supabase.
3. Create `.env` from `.env.example` and set:
   - `SUPABASE_DATABASE_URL` (Supabase Postgres connection string)

## Run

1. Install dependencies:
   - `pip install -r requirements.txt`
2. Start server:
   - `uvicorn main:app --reload --port 8000`

If Supabase is configured correctly, startup will create tables and seed data automatically.

Base URL: `http://localhost:8000/api/v1`

## Auth

- Login with `POST /api/v1/auth/login` to get a bearer token.
- Send header: `Authorization: Bearer <token>` for protected routes.

## OpenAPI JSON

- Runtime docs: `http://localhost:8000/docs`
- Runtime schema: `http://localhost:8000/openapi.json`
- Static file generation: `python scripts/export_openapi.py`
