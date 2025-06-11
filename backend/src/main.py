from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from utils import parser

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()

    try:
        text = parser.parse_file(contents, filename)
    except ValueError as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

    # Just return preview for now
    return JSONResponse(content={
        "filename": filename,
        "length": len(text),
        "preview": text[:300]  # show first 300 characters
    })
