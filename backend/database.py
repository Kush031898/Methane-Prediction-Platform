from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client.methane_project
