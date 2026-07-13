from fastapi import APIRouter

from app.models.semantic_search import (
    SemanticSearchRequest,
    SemanticSearchResponse,
)
from services.search_service import semantic_search

router = APIRouter()


@router.post(
    "/semantic-search",
    response_model=SemanticSearchResponse,
)
def search_threads(request: SemanticSearchRequest):
    results = semantic_search(
        query=request.query,
    )

    return {
        "results": results,
    }