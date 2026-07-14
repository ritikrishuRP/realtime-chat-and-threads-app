import { Router } from "express";
import { z } from "zod";

import {
  askAssistantService,
  duplicateCheckService,
  semanticSearchService,
  similarThreadsService,
  threadSummaryService,
} from "../modules/ai/ai.service.js";

export const aiRouter = Router();

/* -------------------------------------------------------------------------- */
/*                                   Schemas                                  */
/* -------------------------------------------------------------------------- */

const SemanticSearchSchema = z.object({
  query: z.string().trim().min(3),
});

const DuplicateCheckSchema = z.object({
  question: z.string().trim().min(3),
});

const RagAnswerSchema = z.object({
  question: z.string().trim().min(3),
});

/* -------------------------------------------------------------------------- */
/*                             Semantic Search                                */
/* -------------------------------------------------------------------------- */

aiRouter.post("/semantic-search", async (req, res, next) => {
  try {
    const body = SemanticSearchSchema.parse(req.body);

    const result = await semanticSearchService(body.query);

    res.json({
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------- */
/*                           Duplicate Detection                              */
/* -------------------------------------------------------------------------- */

aiRouter.post("/duplicate-check", async (req, res, next) => {
  try {
    const body = DuplicateCheckSchema.parse(req.body);

    const result = await duplicateCheckService(body.question);

    res.json({
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------- */
/*                             Similar Threads                                */
/* -------------------------------------------------------------------------- */

aiRouter.get("/threads/:threadId/similar", async (req, res, next) => {
  try {
    const threadId = Number(req.params.threadId);

    const result = await similarThreadsService(threadId);

    res.json({
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------- */
/*                               RAG Assistant                                */
/* -------------------------------------------------------------------------- */

aiRouter.post("/rag-answer", async (req, res, next) => {
  try {
    const body = RagAnswerSchema.parse(req.body);

    const result = await askAssistantService(body.question);

    res.json({
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------- */
/*                              Thread Summary                                */
/* -------------------------------------------------------------------------- */

aiRouter.get("/threads/:threadId/summary", async (req, res, next) => {
  try {
    const threadId = Number(req.params.threadId);

    const result = await threadSummaryService(threadId);

    res.json({
      data: result,
    });
  } catch (err) {
    next(err);
  }
});