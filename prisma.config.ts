
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL = unpooled connection (port 5432)
    // Required for migrations — pgBouncer/pooler can't run DDL
    // Local dev: same value as DATABASE_URL
    // Supabase prod: use the "Direct connection" string, not the pooler
    url: env("DIRECT_URL"),
  },
});
