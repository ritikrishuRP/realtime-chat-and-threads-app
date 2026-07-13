from repositories.thread_summary_repository import (
    get_thread_for_summary,
)

from services.gemini_service import (
    generate_response,
)

from services.thread_summary_prompt_builder import (
    build_thread_summary_prompt,
)


def generate_thread_summary(
    thread_id: int,
):
    """
    Generate an AI summary
    for a discussion thread.
    """

    discussion = get_thread_for_summary(
        thread_id,
    )

    if discussion is None:
        return None

    prompt = build_thread_summary_prompt(
        discussion,
    )

    summary = generate_response(
        prompt,
    )

    return {
        "summary": summary,
    }