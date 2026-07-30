import axios from "axios";
const aiClient = axios.create({
    baseURL: process.env.AI_SERVICE_URL || "http://localhost:8001",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});
/* -------------------------------------------------------------------------- */
/*                             Semantic Search                                */
/* -------------------------------------------------------------------------- */
export async function semanticSearch(query) {
    const response = await aiClient.post("/semantic-search", {
        query,
    });
    return response.data;
}
/* -------------------------------------------------------------------------- */
/*                           Duplicate Detection                              */
/* -------------------------------------------------------------------------- */
export async function duplicateCheck(question) {
    const response = await aiClient.post("/duplicate-check", {
        question,
    });
    return response.data;
}
/* -------------------------------------------------------------------------- */
/*                             Similar Threads                                */
/* -------------------------------------------------------------------------- */
export async function getSimilarThreads(threadId) {
    const response = await aiClient.get(`/threads/${threadId}/similar`);
    return response.data;
}
/* -------------------------------------------------------------------------- */
/*                               RAG Assistant                                */
/* -------------------------------------------------------------------------- */
export async function askAssistant(question) {
    const response = await aiClient.post("/rag-answer", {
        question,
    });
    return response.data;
}
/* -------------------------------------------------------------------------- */
/*                              Thread Summary                                */
/* -------------------------------------------------------------------------- */
export async function generateThreadSummary(threadId) {
    const response = await aiClient.get(`/threads/${threadId}/summary`);
    return response.data;
}
