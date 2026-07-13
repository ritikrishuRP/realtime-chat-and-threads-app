from services.search_service import semantic_search
from services.prompt_builder import build_context
from services.gemini_service import generate_response


def ask_community_assistant(
    question: str,
):
    """
    Main RAG pipeline.

    Flow

    Question
        ↓
    Semantic Search
        ↓
    Build Context
        ↓
    Build Prompt
        ↓
    Gemini
        ↓
    Return AI Answer
    """

    search_results = semantic_search(
        query=question,
    )

    context = build_context(
        search_results,
    )

    prompt = f"""
You are an AI assistant for a developer community.

Answer the user's question ONLY using the community discussions below.

If the answer cannot be found in the discussions, clearly say you couldn't find enough information.

Community Discussions

{context}

User Question

{question}
"""

    answer = generate_response(
        prompt,
    )

    return answer