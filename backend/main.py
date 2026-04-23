import os

from fastapi import FastAPI, HTTPException, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from routes.auth import router as auth_router
from routes.export import router as export_router
from routes.logs import router as logs_router
from routes.sales import router as sales_router
from routes.settings import router as settings_router
from routes.staff import router as staff_router
from routes.stock import router as stock_router


app = FastAPI(title="Solid Tech Backend API", version="1.0.0")

# CORS origins can be configured with CORS_ORIGINS as a comma-separated list.
cors_origins_env = os.getenv("CORS_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

# Keep local dev origins working out of the box.
if not cors_origins:
    cors_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    message = "Unexpected error"
    if isinstance(exc.detail, dict):
        message = str(exc.detail.get("message", message))
    elif isinstance(exc.detail, str):
        message = exc.detail
    return JSONResponse(status_code=exc.status_code, content={"message": message})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, __):
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": "Validation error"})


app.include_router(auth_router)
app.include_router(sales_router)
app.include_router(stock_router)
app.include_router(staff_router)
app.include_router(logs_router)
app.include_router(settings_router)
app.include_router(export_router)
