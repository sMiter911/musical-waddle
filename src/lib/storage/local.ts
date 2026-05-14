import { mkdir, writeFile, unlink } from "fs/promises";
import { join, extname } from "path";
import type { StorageAdapter, UploadResult } from "./index";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "resources");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export class LocalStorageAdapter implements StorageAdapter {
  async upload(file: File): Promise<UploadResult> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File too large. Maximum size is 50 MB.");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = extname(file.name) || "";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(join(UPLOAD_DIR, safe), buffer);

    return {
      url: `/uploads/resources/${safe}`,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
    };
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/resources/")) return;
    const filename = url.split("/").pop();
    if (!filename) return;
    try {
      await unlink(join(UPLOAD_DIR, filename));
    } catch {
      // File already gone — ignore
    }
  }
}
