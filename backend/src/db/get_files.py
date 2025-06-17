
def get_files(collection):
    result = collection.get(include=["metadatas"])
    metadatas = result["metadatas"]

    files_by_checksum = {}
    for meta in metadatas:
        checksum = meta["checksum"]
        filename = meta["filename"]

        if checksum not in files_by_checksum:
            files_by_checksum[checksum] = filename

    return [
        {
            "filename": fn,
            "checksum": chksum,
            "file_type": fn.split(".")[-1].lower() if "." in fn else "unknown"
        }
        for chksum, fn in files_by_checksum.items()
    ]