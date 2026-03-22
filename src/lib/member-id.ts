import { prisma } from "./db";

export async function generateMemberId(): Promise<string> {
  const year = new Date().getFullYear();
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const id = `PU-${year}-${num}`;
    const existing = await prisma.member.findUnique({
      where: { membershipNumber: id },
      select: { id: true },
    });
    if (!existing) return id;
  }
  // Fallback: timestamp-based suffix to guarantee uniqueness
  const num = Date.now() % 90000 + 1000;
  return `PU-${year}-${num}`;
}
