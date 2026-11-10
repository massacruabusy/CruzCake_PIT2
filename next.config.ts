import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // PGlite (Postgres embarcado usado em desenvolvimento/testes) carrega WASM em runtime;
  // por isso não deve ser empacotado pelo bundler.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
