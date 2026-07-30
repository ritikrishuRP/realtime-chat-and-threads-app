import { askAssistant, duplicateCheck, generateThreadSummary, getSimilarThreads, semanticSearch, } from "../../lib/ai-client.js";
/* -------------------------------------------------------------------------- */
/*                             Semantic Search                                */
/* -------------------------------------------------------------------------- */
export async function semanticSearchService(query) {
    return await semanticSearch(query);
}
/* -------------------------------------------------------------------------- */
/*                           Duplicate Detection                              */
/* -------------------------------------------------------------------------- */
export async function duplicateCheckService(question) {
    const response = await duplicateCheck(question);
    return {
        isDuplicate: response.is_duplicate,
        similarThread: response.similar_thread,
    };
}
/* -------------------------------------------------------------------------- */
/*                             Similar Threads                                */
/* -------------------------------------------------------------------------- */
export async function similarThreadsService(threadId) {
    return await getSimilarThreads(threadId);
}
/* -------------------------------------------------------------------------- */
/*                               RAG Assistant                                */
/* -------------------------------------------------------------------------- */
export async function askAssistantService(question) {
    return await askAssistant(question);
}
/* -------------------------------------------------------------------------- */
/*                              Thread Summary                                */
/* -------------------------------------------------------------------------- */
export async function threadSummaryService(threadId) {
    return await generateThreadSummary(threadId);
}
