import { AxiosInstance } from "axios";

export async function duplicateCheck(
  apiClient: AxiosInstance,
  question: string
) {
  const response = await apiClient.post("/api/ai/duplicate-check", {
    question,
  });

  return response.data.data;
}

export async function semanticSearch(
  apiClient: AxiosInstance,
  query: string
) {
  const response = await apiClient.post("/api/ai/semantic-search", {
    query,
  });

  return response.data.data;
}

export async function getThreadSummary(
  apiClient: AxiosInstance,
  threadId: number
) {
  const response = await apiClient.get(
    `/api/ai/threads/${threadId}/summary`
  );

  return response.data.data;
}

export async function getSimilarThreads(
  apiClient: AxiosInstance,
  threadId: number
) {
  const response = await apiClient.get(
    `/api/ai/threads/${threadId}/similar`
  );

  return response.data.data;
}

