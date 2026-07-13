from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    PROJECT_NAME: str = "Realtime Community AI Service"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:6450/realtime_chat_and_threads_app",
    )

    EMBEDDING_MODEL: str = "gemini-embedding-001"

    CHAT_MODEL: str = "gemini-2.5-flash"


settings = Settings()