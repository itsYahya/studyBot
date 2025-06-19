
def serialize_item(item):
    item["id"] = str(item["_id"])
    del item["_id"]
    return item