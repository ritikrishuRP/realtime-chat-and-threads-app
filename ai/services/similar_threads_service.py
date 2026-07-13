from repositories.search_repository import (
    get_thread_embedding,
    search_similar_threads,
)


def get_similar_threads(
    thread_id: int,
    limit: int = 5,
):
    """
    Find threads that are semantically similar
    to the given thread.
    """

    embedding = get_thread_embedding(thread_id)

    if embedding is None:
        return []

    results = search_similar_threads(
        query_embedding=embedding,
        limit=limit + 1,
    )

    filtered_results = [
        result
        for result in results
        if result["id"] != thread_id
    ]

    return filtered_results[:limit]