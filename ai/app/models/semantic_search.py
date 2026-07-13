from pydantic import BaseModel


class SemanticSearchRequest(BaseModel):
    query: str


class SemanticSearchResult(BaseModel):
    id: int
    title: str
    body: str
    distance: float


class SemanticSearchResponse(BaseModel):
    results: list[SemanticSearchResult]