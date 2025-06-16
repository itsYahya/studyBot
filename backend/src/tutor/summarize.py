# summarize.py

from llm_lib.client import query_llm
from db.store_vector import collection

def summarize_document(checksum: str) -> str:
    result = collection.get(where={"checksum": checksum}, include=["documents"])
    chunks = result["documents"][0]
    
    if not chunks:
        return "No content found for this document."

    full_context = "\n\n".join(chunks)

    prompt = f"""
You are an academic assistant. Read the following text and summarize it into clear, concise bullet points **in the same language**.

Content:
{full_context}

Summary:
"""
    summary = query_llm(prompt)
    return summary
