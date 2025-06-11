import fitz  # PyMuPDF
import docx
import io

def parse_pdf(file_bytes):
    text = ""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text

def parse_docx(file_bytes):
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([p.text for p in doc.paragraphs])

def parse_txt(file_bytes):
    return file_bytes.decode("utf-8")

def parse_file(file_bytes, filename):
    if filename.endswith(".pdf"):
        return parse_pdf(file_bytes)
    elif filename.endswith(".docx"):
        return parse_docx(file_bytes)
    elif filename.endswith(".txt"):
        return parse_txt(file_bytes)
    else:
        raise ValueError("Unsupported file format")
