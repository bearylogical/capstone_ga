from bson import ObjectId


def fetch_recommended_document(document_id, mongo_conn, model, n_results=6):
    """
    Fetch documents from mongoDB based on inference

    """
    document = mongo_conn.parliament.articles.find_one({'_id': ObjectId(document_id)})
    inference = model.infer_vector(document['cleaned_join'].split())
    results = model.docvecs.most_similar([inference])
    ids = []
    for item in results[:n_results]:
        if item[0] != document_id:
            ids.append(ObjectId(item[0]))

    recommends = []
    for recommend in mongo_conn.parliament.articles.find({"_id": {"$in": ids}}):
        recommends.append({
            "_id": str(recommend["_id"]),
            "title": recommend["title"],
            "sitting_date": recommend["sitting_date"],
            "session_type": recommend["session_type"]
        })
    # print(recommends)
    return recommends