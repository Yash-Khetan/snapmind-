import { apiGet, apiPostFormData } from "./client";
import type { ImageRecord, ImageListResponse, ConnectionsResponse, UploadResult } from "../types";

export function getAllImages(sort: "newest" | "connections" = "newest"): Promise<ImageListResponse> {
  return apiGet<ImageListResponse>(`/images?sort=${sort}`);
}

export function getImage(id: number): Promise<ImageRecord> {
  return apiGet<ImageRecord>(`/images/${id}`);
}

export function getConnections(imageId: number): Promise<ConnectionsResponse> {
  return apiGet<ConnectionsResponse>(`/connections/${imageId}`);
}

export function uploadMultipleImages(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }
  return apiPostFormData<UploadResult[]>("/upload-multiple", formData);
}
