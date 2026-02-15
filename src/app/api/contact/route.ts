import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json();
    const message = await prisma.contactMessage.create({
        data: {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
        }
    });
    return NextResponse.json(message);
}
