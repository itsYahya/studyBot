from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument

MONGO_URI = "mongodb://mongodb:27017"
client = AsyncIOMotorClient(MONGO_URI)

db = client["studyBot_db"]
chat_history = db["chat_history"]
questions = db["questions"]
