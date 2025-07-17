from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume

app = FastAPI()

# Allow CORS for frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)