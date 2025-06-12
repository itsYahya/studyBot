
def chunk_text(text, max_tokens=300):
    sentences = text.split('.')
    chunks, current = [], []
    token_count = 0

    for s in sentences:
        token_count += len(s.split())
        current.append(s)

        if token_count >= max_tokens:
            chunks.append('. '.join(current) + '.')
            current, token_count = [], 0

    if current:
        chunks.append('. '.join(current) + '.')

    return chunks