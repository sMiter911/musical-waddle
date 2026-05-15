// Cloudflare R2 storage adapter (S3-compatible, zero egress fees)
// Required env vars:
//   R2_ACCOUNT_ID       — Cloudflare account ID
//   R2_BUCKET           — bucket name
//   R2_ACCESS_KEY_ID    — R2 API token (Access Key ID)
//   R2_SECRET_ACCESS_KEY— R2 API token (Secret Access Key)
// Optional:
//   R2_PUBLIC_URL       — custom domain or r2.dev public URL for serving files
//                         e.g. https://pub-xxxx.r2.dev  or  https://files.yourdomain.com

import type { StorageAdapter, UploadResult } from "./index";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export class R2StorageAdapter implements StorageAdapter {
  private bucket = process.env.R2_BUCKET!;
  private accountId = process.env.R2_ACCOUNT_ID!;
  private accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  private secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
  private publicUrl = process.env.R2_PUBLIC_URL;

  private get endpoint() {
    return `https://${this.accountId}.r2.cloudflarestorage.com`;
  }

  private client() {
    return import("@aws-sdk/client-s3").then(({ S3Client }) =>
      new S3Client({
        region: "auto",
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      })
    );
  }

  async upload(file: File): Promise<UploadResult> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Maximum size is 50 MB.");
    }

    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = await this.client();

    const ext = file.name.split(".").pop() ?? "bin";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );

    const base = this.publicUrl
      ? this.publicUrl.replace(/\/$/, "")
      : `${this.endpoint}/${this.bucket}`;

    return {
      url: `${base}/${key}`,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
    };
  }

  async delete(url: string): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = await this.client();

    const base = this.publicUrl
      ? this.publicUrl.replace(/\/$/, "")
      : `${this.endpoint}/${this.bucket}`;

    const key = url.replace(`${base}/`, "");
    await s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
