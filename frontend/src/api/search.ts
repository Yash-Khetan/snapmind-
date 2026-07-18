import { apiPost } from "./client";
import type { SearchResponse } from "../types";

export function searchImages(query: string): Promise<SearchResponse> {
  return apiPost<SearchResponse>("/search", { query });
}
