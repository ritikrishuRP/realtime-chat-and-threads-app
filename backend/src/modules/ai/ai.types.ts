export type SemanticSearchRequest = {
  query: string;
};

export type SemanticSearchResult = {
  id: number;
  title: string;
  body: string;
  distance: number;
};

export type SemanticSearchResponse = {
  results: SemanticSearchResult[];
};

export type DuplicateDetectionRequest = {
  question: string;
};

export type DuplicateDetectionResponse = {
  isDuplicate: boolean;
  similarThread: SemanticSearchResult | null;
};

export type RagAnswerRequest = {
  question: string;
};

export type RagAnswerResponse = {
  answer: string;
};

export type ThreadSummaryResponse = {
  summary: string;
};