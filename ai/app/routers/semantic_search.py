from fastapi import APIRouter

from app.models.semantic_search import (
    SemanticSearchRequest,
    SemanticSearchResponse,
)
from services.search_service import semantic_search
from services.similar_threads_service import get_similar_threads

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