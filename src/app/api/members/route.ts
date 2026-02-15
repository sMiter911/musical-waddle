import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.member.findUnique({
        where: { userId: session.user.id },
        include: { branch: true }
    });
    return NextResponse.json(member);
}

export async function PUT(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const updatedMember = await prisma.member.upsert({
        where: { userId: session.user.id },
        update: data,
        create: {
            ...data,
            userId: session.user.id,
        }
    });
    return NextResponse.json(updatedMember);
}
