import { apiGet } from "./client";
import type { GraphResponse } from "../types";

export function getGraphData(): Promise<GraphResponse> {
  return apiGet<GraphResponse>("/graph");
}
