import chromadb

# Initialize ChromaDB Persistent Client
client = chromadb.PersistentClient(path="/chdb_data")
collection = client.get_or_create_collection(name="study_materials")

def existing(checksum):
    existing = collection.get(
        where={"checksum": checksum},
        include=["metadatas"]
    )

    if existing["metadatas"]:
        print(f"Skipping duplicate file: {checksum}")
        return True  # Already exists
    return False

def store_chunks(chunks: list, embeddings: list, metadata: dict):
    """
    Store chunks in ChromaDB with metadata.
    """
    ids = [f"{metadata['checksum']}-{i}" for i in range(len(chunks))]
    metadatas = [{**metadata, "chunk_index": i} for i in range(len(chunks))]

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )

    print(f"Stored {len(chunks)} chunks for: {metadata['filename']}")
    return True
