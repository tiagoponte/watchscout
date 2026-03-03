import "dotenv/config"; // loads .env
import { config } from "dotenv";
config({ path: ".env.local", override: true }); // .env.local takes priority (Next.js convention)

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"]!,
  },
});
