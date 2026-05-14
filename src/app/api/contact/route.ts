import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name:      z.string().min(2).max(120),
  email:     z.string().email(),
  phone:     z.string().max(30).optional(),
  subject:   z.string().min(2).max(200),
  message:   z.string().min(10).max(5000),
  _hp:       z.string().max(0, "Bot detected"), // honeypot — must be empty
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: first }, { status: 422 });
  }

  const { name, email, phone, subject, message } = result.data;

  const saved = await prisma.contactMessage.create({
    data: { name, email, phone: phone ?? null, subject, message },
    select: { id: true },
  });

  return NextResponse.json({ success: true, id: saved.id }, { status: 201 });
}
