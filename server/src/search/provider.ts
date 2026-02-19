// server/src/search/provider.ts
import type { AneeqData } from "../data/aneeq-data.js";

export interface SearchResult {
  view: string;
  data: unknown;
  score: number;
  matchedFields: string[];
}

export interface SearchProvider {
  search(query: string, data: AneeqData): SearchResult[];
}
