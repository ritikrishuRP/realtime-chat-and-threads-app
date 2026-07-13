from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings


gemini_chat = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.2,
)


def generate_response(
    prompt: str,
) -> str:
    """
    Send a prompt to Gemini
    and return the generated text.
    """

    response = gemini_chat.invoke(prompt)

    return response.content