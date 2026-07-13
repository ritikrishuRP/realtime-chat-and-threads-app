from repositories.search_repository import (
    search_similar_threads,
)
from services.embedding_service import embedding_service


def semantic_search(
    query: str,
    limit: int = 5,
):
    """
    Perform semantic search using vector embeddings.
    """

    query_embedding = embedding_service.generate_embedding(query)

    results = search_similar_threads(
        query_embedding=query_embedding,
        limit=limit,
    )

    SIMILARITY_THRESHOLD = 0.40

    filtered_results = [
        result
        for result in results
        if result["distance"] <= SIMILARITY_THRESHOLD
    ]

    return filtered_results