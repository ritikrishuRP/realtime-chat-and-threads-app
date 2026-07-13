from pydantic import BaseModel


class ThreadSummaryResponse(BaseModel):
    summary: str