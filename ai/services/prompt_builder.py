def build_context(
    search_results: list[dict],
) -> str:
    """
    Convert retrieved threads into
    a prompt-friendly context string.
    """

    if not search_results:
        return "No relevant community discussions found."

    context = ""

    for index, thread in enumerate(
        search_results,
        start=1,
    ):
        context += (
            f"Thread {index}\n"
            f"Title: {thread['title']}\n"
            f"Content: {thread['body']}\n\n"
        )

    return context