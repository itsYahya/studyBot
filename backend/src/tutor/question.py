from llm_lib.client import query_llm

def ask(model, collection, checksum, question):
    question_embedding = model.encode(question).tolist()

    # Step 2: Retrieve top-k relevant chunks for that file
    result = collection.query(
        query_embeddings=[question_embedding],
        n_results=5,
        include=["documents"]
    )
    chunks = result["documents"][0]
    context = "\n\n".join(chunks)

    # Step 3: Ask LLM
    prompt = f"""
You are a helpful assistant. Use the following course material to answer the question **in the same language**.

Course content:
{context}

Question:
{question}

Answer:
"""

    answer = query_llm(prompt)
    return answer