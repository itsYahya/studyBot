from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer
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

model = SentenceTransformer("BAAI/bge-m3")

app = FastAPI()

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
def ask_question(data: AskRequest):
    answer = ask(model, collection, data.checksum, data.question)
    return answer

@app.post("/quiz/{checksum}")
def quiz(checksum: str):
    res = generate_quiz(checksum, collection)
    return res