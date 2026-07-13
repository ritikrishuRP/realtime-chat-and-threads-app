from pydantic import BaseModel


class CommunityAssistantRequest(BaseModel):
    question: str


class CommunityAssistantResponse(BaseModel):
    answer: str