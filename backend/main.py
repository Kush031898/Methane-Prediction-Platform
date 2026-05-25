from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, predict

app = FastAPI(title="Methane Prediction API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(predict.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Methane Prediction API"}
