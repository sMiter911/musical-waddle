import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Read JSON seed files
    const structuresPath = path.join(process.cwd(), "dev assets", "Structures.json");
    const branchesPath = path.join(process.cwd(), "dev assets", "Branches.json");

    const structuresData: { id: number; structure: string }[] = JSON.parse(
        fs.readFileSync(structuresPath, "utf-8")
    );
    const branchesData: { id: number; branch: string; branch_structure: number }[] = JSON.parse(
        fs.readFileSync(branchesPath, "utf-8")
    );

    // Seed structures
    for (const s of structuresData) {
        await prisma.structure.upsert({
            where: { id: s.id },
            update: { name: s.structure },
            create: { id: s.id, name: s.structure },
        });
    }
    console.log(`  ✓ Seeded ${structuresData.length} structures`);

    // Seed branches
    for (const b of branchesData) {
        await prisma.branch.upsert({
            where: { id: b.id },
            update: { name: b.branch.trim(), structureId: b.branch_structure },
            create: { id: b.id, name: b.branch.trim(), structureId: b.branch_structure },
        });
    }
    console.log(`  ✓ Seeded ${branchesData.length} branches`);

    console.log("✅ Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
