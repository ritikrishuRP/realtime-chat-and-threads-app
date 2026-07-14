import {
  askAssistant,
  duplicateCheck,
  generateThreadSummary,
  getSimilarThreads,
  semanticSearch,
} from "../../lib/ai-client.js";

import {
  DuplicateDetectionResponse,
  RagAnswerResponse,
  SemanticSearchResponse,
  ThreadSummaryResponse,
} from "./ai.types.js";

/* -------------------------------------------------------------------------- */
/*                             Semantic Search                                */
/* -------------------------------------------------------------------------- */

export async function semanticSearchService(
  query: string
): Promise<SemanticSearchResponse> {
  return await semanticSearch(query);
}

/* -------------------------------------------------------------------------- */
/*                           Duplicate Detection                              */
/* -------------------------------------------------------------------------- */

export async function duplicateCheckService(
  question: string
): Promise<DuplicateDetectionResponse> {
  const response = await duplicateCheck(question);

  return {
    isDuplicate: response.is_duplicate,
    similarThread: response.similar_thread,
  };
}

/* -------------------------------------------------------------------------- */
/*                             Similar Threads                                */
/* -------------------------------------------------------------------------- */

export async function similarThreadsService(
  threadId: number
): Promise<SemanticSearchResponse> {
  return await getSimilarThreads(threadId);
}

/* -------------------------------------------------------------------------- */
/*                               RAG Assistant                                */
/* -------------------------------------------------------------------------- */

export async function askAssistantService(
  question: string
): Promise<RagAnswerResponse> {
  return await askAssistant(question);
}

/* -------------------------------------------------------------------------- */
/*                              Thread Summary                                */
/* -------------------------------------------------------------------------- */

export async function threadSummaryService(
  threadId: number
): Promise<ThreadSummaryResponse> {
  return await generateThreadSummary(threadId);
}