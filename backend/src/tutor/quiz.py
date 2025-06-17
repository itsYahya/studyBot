from llm_lib.client import query_llm

def generate_quiz(checksum, collection):
    result = collection.get(where={"checksum": checksum}, include=["documents"])
    chunks = result["documents"][0]

    if not chunks:
        return {"error": "No content found for this checksum."}

    context = "\n\n".join(chunks)

    prompt = f"""
You are an academic quiz assistant. Based on the course content below, generate a quiz that tests **comprehension and understanding**, not memorization or trivia. **in the same language**.

Rules:
- Do **not** ask shallow or literal questions (e.g. "What is the first word in the text?")
- Focus on **key concepts, reasoning, and cause-effect relationships**
- Use clear multiple-choice format (A-D)
- Indicate the correct answer for each

Only return the questions and answers in clear structured text.

Course Material:
{context}

Quiz:
"""

    response = query_llm(prompt)

    return {"quiz": response}