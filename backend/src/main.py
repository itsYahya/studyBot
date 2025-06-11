from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()

    return JSONResponse(content={
        "filename": filename,
        "size_bytes": len(contents),
        "content_type": file.content_type,
        "message": "File received"
    })