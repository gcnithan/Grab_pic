require("dotenv").config();
const { defineConfig, env } = require("@prisma/config");

module.exports = defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),       // The -pooler link for the app
    directUrl: env("DIRECT_URL"),   // The direct link for migrations
  },
});