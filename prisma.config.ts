import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
  migrate: {
    async adapter(env) {
      const pool = new Pool({ connectionString: env.DIRECT_URL });
      return new PrismaPg(pool);
    },
  },
});
