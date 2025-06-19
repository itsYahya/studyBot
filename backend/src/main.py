from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer
from datetime import datetime
from utils.parser import parse_file
from utils.checksum import calculate_checksum
from utils.chunk_text import chunk_text
from db.store_vector import store_chunks
from db.store_vector import existing
from tutor.summarize import summarize_document
from db.get_files import get_files
from db.store_vector import collection
from tutor.question import ask
from tutor.quiz import generate_quiz
from models.ask_request import AskRequest
from models.ask_request import ChatMsg
from models.pagination_request import PaginationRequest
from db.mongodb import chat_history
from db.mongodb import questions
from utils.serialize_item import serialize_item
from fastapi.middleware.cors import CORSMiddleware

model = SentenceTransformer("BAAI/bge-m3")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()
    checksum = calculate_checksum(contents)

    if existing(checksum=checksum):
        return {"message": "File already uploaded", "filename": file.filename}
    
    try:
        text = parse_file(contents, filename)
    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

    model = SentenceTransformer("BAAI/bge-m3")
    chunks = chunk_text(text)
    embeddings = model.encode(chunks).tolist()

    success = store_chunks(
        chunks=chunks,
        embeddings=embeddings,
        metadata={"filename": file.filename, "checksum": checksum}
    )

    return {
        "message": "File processed and stored",
        "filename": file.filename,
        "checksum": checksum,
        "chunks": len(chunks)
    }

@app.get("/summarize/{checksum}")
def summarize(checksum: str):
    summary = summarize_document(checksum)
    return {"summary": summary}

@app.get("/files")
def list_uploaded_files():
    files = get_files(collection)

    return files

@app.post("/ask")
async def ask_question(data: AskRequest):
    result = await chat_history.insert_one(ChatMsg(right = True, message = data.question, date = str(datetime.now())).dict())
    id = await questions.insert_one(data.dict())
    #answer = ask(model, collection, data.checksum, data.question)
    result = await chat_history.insert_one(ChatMsg(right = False, message = "this is the bot answer!", date = str(datetime.now())).dict())
    return {"answer": str(result.inserted_id)}

@app.post("/quiz/{checksum}")
def quiz(checksum: str):
    res = generate_quiz(checksum, collection)
    return res


@app.post("/chat_history/")
async def get_items(payload: PaginationRequest):
    page = max(payload.page, 1)
    limit = min(max(payload.limit, 1), 20)

    skip = (page - 1) * limit
    cursor = chat_history.find({}).skip(skip).limit(limit)

    items = [serialize_item(doc) async for doc in cursor]
    total = await chat_history.count_documents({})

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }