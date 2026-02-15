import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const structures = await prisma.structure.findMany({
            include: {
                branches: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(structures);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch structures" }, { status: 500 });
    }
}
