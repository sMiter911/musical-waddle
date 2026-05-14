export interface UploadResult {
  url: string;
  fileType: string;
  fileSize: number;
}

export interface StorageAdapter {
  upload(file: File): Promise<UploadResult>;
  delete(url: string): Promise<void>;
}

// Swap the import here to switch to S3/R2/Supabase
export async function getStorageAdapter(): Promise<StorageAdapter> {
  const { LocalStorageAdapter } = await import("./local");
  return new LocalStorageAdapter();
}
