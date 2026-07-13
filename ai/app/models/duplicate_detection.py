from pydantic import BaseModel

from app.models.semantic_search import SemanticSearchResult


class DuplicateDetectionRequest(BaseModel):
    question: str


class DuplicateDetectionResponse(BaseModel):
    is_duplicate: bool
    similar_thread: SemanticSearchResult | None