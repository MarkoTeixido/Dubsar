export type FileCategory = "image" | "document" | "text" | "json" | "other";

export interface FileData {
  url: string;
  name: string;
  type: string;
  size: number;
  category: FileCategory;
}

export interface FileUploadStatus {
  canUpload: boolean;
  current: number;
  limit: number;
  remaining: number;
}

export interface UploadResponse {
  success: boolean;
  file: FileData;
  uploadStatus: FileUploadStatus;
}