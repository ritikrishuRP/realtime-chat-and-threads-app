from fastapi import FastAPI

from app.routers.semantic_search import router as semantic_search_router

app = FastAPI(
    title="Realtime Community AI Service",
    version="1.0.0",
    description="AI microservice for semantic search and RAG.",
)


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "Realtime Community AI Service",
    }


app.include_router(
    semantic_search_router,
)