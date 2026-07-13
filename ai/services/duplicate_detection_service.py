from services.embedding_service import embedding_service
from repositories.search_repository import search_similar_threads


DUPLICATE_THRESHOLD = 0.15


def detect_duplicate_question(
    question: str,
):
    """
    Detect whether a new question is
    likely a duplicate of an existing thread.
    """

    embedding = embedding_service.generate_embedding(
        question,
    )

    results = search_similar_threads(
        query_embedding=embedding,
        limit=1,
    )

    if not results:
        return {
            "is_duplicate": False,
            "similar_thread": None,
        }

    best_match = results[0]

    is_duplicate = (
        best_match["distance"]
        <= DUPLICATE_THRESHOLD
    )

    return {
        "is_duplicate": is_duplicate,
        "similar_thread": best_match if is_duplicate else None,
    }