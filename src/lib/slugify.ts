import { prisma } from "./db";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureUniqueSlug(
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return slug;

    slug = `${base}-${suffix}`;
    suffix++;
  }
}
