import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/models/db/schema.ts",
  out: "./database/migrations",
  casing: "snake_case",
});
