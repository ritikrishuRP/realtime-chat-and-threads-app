from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.config import settings


class EmbeddingService:
    def __init__(self):
        self.embedding_model = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
        )

    def generate_embedding(self, text: str):
        return self.embedding_model.embed_query(text)


embedding_service = EmbeddingService()