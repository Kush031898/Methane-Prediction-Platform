from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import engine, Base
from .routers import users, predict

# Create tables if not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Methane Prediction API")

# Add CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change to the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(predict.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Methane Prediction API"}
