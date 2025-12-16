import { defineConfig } from "drizzle-kit";

// Get database URL from environment variable
// Format: postgresql://username:password@hostname:port/database
const getDatabaseUrl = (): string => {
  // Check if DATABASE_URL is set (for production/external)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Otherwise, construct from individual environment variables
  // Render.com PostgreSQL external URL format: hostname.region-postgres.render.com
  let hostname = process.env.DB_HOST || "dpg-d4vo1ehr0fns739pgqe0-a.singapore-postgres.render.com";

  // If hostname doesn't contain a dot, it might be an internal hostname
  // Try to construct external URL (common Render.com pattern)
  if (!hostname.includes('.')) {
    // Default to singapore region based on provided information
    hostname = `${hostname}.singapore-postgres.render.com`;
  }

  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME || "cocobebe_2s46";
  const username = process.env.DB_USER || "cocobebe_2s46_user";
  const password = process.env.DB_PASSWORD || "AhUhpJ0JSwNrcNcvMzlybL6iDYRxpgx4";

  // Render.com requires SSL for external connections
  return `postgresql://${username}:${password}@${hostname}:${port}/${database}?sslmode=require`;
};

const connectionString = getDatabaseUrl();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
