# Frontend & Backend Connection Setup

Your frontend and backend are now connected! Here's how to run them together.

## Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- PostgreSQL running and accessible
- Backend `.env` file configured with `DATABASE_URL`

## Quick Start

### Option 1: Using Two Terminal Windows (Recommended)

#### Terminal 1: Start the Backend

```bash
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

python -m uvicorn main:app --reload --port 8000
```

The backend will start at `http://localhost:8000`

#### Terminal 2: Start the Frontend

```bash
cd frontend
npm install  # if dependencies not installed yet
npm run dev
```

The frontend will start at `http://localhost:5173`

### Option 2: Using One Terminal with Background Process

```bash
# Start backend in background
cd backend
.venv\Scripts\activate
python -m uvicorn main:app --reload --port 8000 &

# In same terminal, start frontend
cd ../frontend
npm run dev
```

## Environment Configuration

### Backend

- **Port**: 8000 (default)
- **Database**: Configure in `backend/.env` with your `DATABASE_URL`

### Frontend

- **Port**: 5173 (Vite default)
- **API Base URL**: `http://localhost:8000` (configured in `frontend/.env.local`)

### CORS Configuration

The backend is configured to accept requests from:

- `http://localhost:5173`
- `http://localhost:3000`
- `http://127.0.0.1:5173`

## Testing the Connection

1. Start both the backend and frontend
2. Go to `http://localhost:5173` in your browser
3. Login with default credentials:
   - Username: `Aisha` or `Granny`
   - PIN: `1234` or `0000`
4. The app will now use the real API instead of mock data

## API Endpoints

All API calls go to `http://localhost:8000/api/v1/`

Key endpoints:

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /sales` - Get sales
- `POST /sales` - Record a sale
- `GET /stock` - Get products
- `GET /staff` - Get staff members
- `GET /logs` - Get activity logs
- `GET /settings` - Get settings
- `GET /export/snapshot` - Export data

## Troubleshooting

### Port Already in Use

If port 8000 or 5173 is already in use:

- Backend: `python -m uvicorn main:app --reload --port 8001`
- Frontend: Update `VITE_API_URL` in `.env.local` and restart

### CORS Errors

Check that the frontend URL matches one of the allowed origins in `backend/main.py`

### Database Connection Error

Ensure your `DATABASE_URL` in `backend/.env` is correct and PostgreSQL is running

### Frontend Can't Reach Backend

- Check backend is running on port 8000
- Verify `VITE_API_URL` in `frontend/.env.local` is correct
- Check browser console for detailed error messages
