export interface UploadResult {
  url: string;
  fileType: string;
  fileSize: number;
}

export interface StorageAdapter {
  upload(file: File): Promise<UploadResult>;
  delete(url: string): Promise<void>;
}

export async function getStorageAdapter(): Promise<StorageAdapter> {
  const hasR2 =
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_BUCKET &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY;

  if (hasR2) {
    const { R2StorageAdapter } = await import("./r2");
    return new R2StorageAdapter();
  }

  const hasS3 =
    process.env.S3_BUCKET &&
    process.env.S3_REGION &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY;

  if (hasS3) {
    const { S3StorageAdapter } = await import("./s3");
    return new S3StorageAdapter();
  }

  const { LocalStorageAdapter } = await import("./local");
  return new LocalStorageAdapter();
}
