// ─── Auth ────────────────────────────────────────────────────────────

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  queries: string[];
}

// ─── Images ──────────────────────────────────────────────────────────

export interface ImageRecord {
  id: number;
  filename: string;
  filepath: string;
  ocr_text: string | null;
  uploaded_at: string;
  connections_count: number;
}

export interface ImageListResponse {
  images: ImageRecord[];
  total: number;
}

export interface UploadResult {
  id: number;
  filename: string;
  path: string;
  ocr_text: string | null;
  connections_created: number;
}

// ─── Connections ─────────────────────────────────────────────────────

export interface ConnectedImage {
  image_id: number;
  filename: string;
  filepath: string;
  ocr_text: string | null;
  similarity_score: number;
}

export interface ConnectionsResponse {
  image_id: number;
  connections: ConnectedImage[];
}

// ─── Search ──────────────────────────────────────────────────────────

export interface SearchResultItem {
  id: number;
  filename: string;
  filepath: string;
  ocr_text: string | null;
  similarity_score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  count: number;
}

// ─── Graph ───────────────────────────────────────────────────────────

export interface GraphNode {
  id: number;
  filename: string;
  filepath: string;
  ocr_text: string | null;
}

export interface GraphEdge {
  source: number;
  target: number;
  similarity_score: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
