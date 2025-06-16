import httpx

def query_llm(prompt: str, model: str = "mistral") -> str:
    response = httpx.post(
        "http://llm:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=9999
    )
    return response.json()["response"]
