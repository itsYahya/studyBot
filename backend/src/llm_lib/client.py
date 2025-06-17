import httpx

def query_llm(prompt: str, model: str = "mistral") -> str:
    response = httpx.post(
        "http://llm:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=9999
    )

    res = response.json()
    
    if "response" in res:
        return res["response"]
    elif "error" in res:
        raise RuntimeError(f"LLM Error: {res['error']}")
    else:
        raise RuntimeError(f"Unexpected response: {res}")