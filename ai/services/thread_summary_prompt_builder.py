def build_thread_summary_prompt(
    discussion: dict,
) -> str:
    """
    Convert a thread and its replies
    into a prompt for Gemini.
    """

    thread = discussion["thread"]
    replies = discussion["replies"]

    prompt = f"""
You are an AI assistant.

Your task is to summarize the following community discussion.

Focus on:

- Main problem
- Important solutions
- Key recommendations
- Overall conclusion

Thread Title:
{thread["title"]}

Original Post:
{thread["body"]}

Replies:

"""

    for index, reply in enumerate(
        replies,
        start=1,
    ):
        prompt += (
            f"Reply {index}:\n"
            f"{reply['body']}\n\n"
        )

    prompt += """
Write a concise summary in clear English.
"""

    return prompt