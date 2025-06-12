from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer
from utils.parser import parse_file
from utils.checksum import calculate_checksum
from utils.chunk_text import chunk_text
from db.store_vector import store_chunks
from db.store_vector import existing


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
