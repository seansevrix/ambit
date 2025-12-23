// backend/prisma.config.ts
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  // Where your schema.prisma lives
  schema: "prisma/schema.prisma",

  // Where migrations will be stored
  migrations: {
    path: "prisma/migrations",
  },

  // Tell Prisma to use DATABASE_URL from .env
  datasource: {
    url: env("DATABASE_URL"),
  },
});
