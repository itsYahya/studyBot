from llm_lib.client import query_llm

def generate_quiz(checksum, collection):
    result = collection.get(where={"checksum": checksum}, include=["documents"])
    chunks = result["documents"][0]

    if not chunks:
        return {"error": "No content found for this checksum."}

    # Step 2: Prepare content and prompt
    context = "\n\n".join(chunks)

    prompt = f"""
You are an educational assistant. Based on the following course material, generate a quiz with 20 multiple-choice questions **in the same language**.

Each question must have:
- The question text
- 4 answer choices labeled A-D
- The correct answer letter (A/B/C/D)

Only return the questions and answers in clear structured text.

Course Material:
{context}

Quiz:
"""

    # Step 3: Query LLM (Ollama or other)
    response = query_llm(prompt)

    return {"quiz": response}