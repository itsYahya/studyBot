from pydantic import BaseModel

class AskRequest(BaseModel):
    question: str
    checksum: str

class ChatMsg(BaseModel):
    message: str
    date: str
    right: bool
