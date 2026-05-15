// S3-compatible storage adapter (AWS S3 / Cloudflare R2)
// Required env vars: S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
// Optional: S3_ENDPOINT (for R2: https://<account>.r2.cloudflarestorage.com)
//           S3_PUBLIC_URL (CDN/public base URL, defaults to AWS path-style)

import type { StorageAdapter, UploadResult } from "./index";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export class S3StorageAdapter implements StorageAdapter {
  private bucket = process.env.S3_BUCKET!;
  private region = process.env.S3_REGION!;
  private accessKeyId = process.env.S3_ACCESS_KEY_ID!;
  private secretAccessKey = process.env.S3_SECRET_ACCESS_KEY!;
  private endpoint = process.env.S3_ENDPOINT;
  private publicUrl = process.env.S3_PUBLIC_URL;

  async upload(file: File): Promise<UploadResult> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Maximum size is 50 MB.");
    }

    // Lazy-load AWS SDK to keep the local dev bundle lean
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      region: this.region,
      credentials: { accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey },
      ...(this.endpoint ? { endpoint: this.endpoint, forcePathStyle: true } : {}),
    });

    const ext = file.name.split(".").pop() ?? "bin";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );

    const base = this.publicUrl
      ? this.publicUrl.replace(/\/$/, "")
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    return {
      url: `${base}/${key}`,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
    };
  }

  async delete(url: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      region: this.region,
      credentials: { accessKeyId: this.accessKeyId, secretAccessKey: this.secretAccessKey },
      ...(this.endpoint ? { endpoint: this.endpoint, forcePathStyle: true } : {}),
    });

    const base = this.publicUrl
      ? this.publicUrl.replace(/\/$/, "")
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    const key = url.replace(`${base}/`, "");
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
