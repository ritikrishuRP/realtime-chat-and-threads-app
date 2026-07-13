from fastapi import APIRouter

from app.models.semantic_search import (
    SemanticSearchRequest,
    SemanticSearchResponse,
)

from app.models.duplicate_detection import (
    DuplicateDetectionRequest,
    DuplicateDetectionResponse,
)

from app.models.community_assistant import (
    CommunityAssistantRequest,
    CommunityAssistantResponse,
)

from services.search_service import semantic_search
from services.similar_threads_service import get_similar_threads
from services.duplicate_detection_service import (
    detect_duplicate_question,
)
from services.rag_service import ask_community_assistant

router = APIRouter()


@router.post(
    "/semantic-search",
    response_model=SemanticSearchResponse,
)
def search_threads(
    request: SemanticSearchRequest,
):
    results = semantic_search(
        query=request.query,
    )

    return {
        "results": results,
    }


@router.get(
    "/threads/{thread_id}/similar",
    response_model=SemanticSearchResponse,
)
def similar_threads(
    thread_id: int,
):
    results = get_similar_threads(
        thread_id=thread_id,
    )

    return {
        "results": results,
    }


@router.post(
    "/duplicate-check",
    response_model=DuplicateDetectionResponse,
)
def duplicate_check(
    request: DuplicateDetectionRequest,
):
    return detect_duplicate_question(
        question=request.question,
    )


@router.post(
    "/community-assistant",
    response_model=CommunityAssistantResponse,
)
def community_assistant(
    request: CommunityAssistantRequest,
):
    answer = ask_community_assistant(
        question=request.question,
    )

    return {
        "answer": answer,
    }