import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.ts";

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

// Log connection string (without password) for debugging
const maskedUrl = connectionString.replace(/:[^:@]+@/, ":****@");
console.log(`[DB] Connecting to database: ${maskedUrl}`);

// Create a connection pool with connection timeout
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Render External DBs need SSL; allow self-signed
  ssl: { rejectUnauthorized: false },
});

// Test connection and check if tables exist
let dbConnected = false;
let dbTablesExist = false;
let dbError: Error | null = null;

// Test connection asynchronously
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("[DB] Database connection successful");
    dbConnected = true;
    
    // Check if tables exist
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('posts', 'album_photos', 'app_users', 'teachers', 'classes', 'registered_children', 'site_settings')
        LIMIT 1
      `);
      if (result.rows && result.rows.length > 0) {
        console.log("[DB] Database tables exist");
        dbTablesExist = true;
      } else {
        console.warn("[DB] Database tables do not exist. Run 'npm run db:push' to create them.");
        dbTablesExist = false;
      }
    } catch (tableErr: any) {
      console.warn("[DB] Could not check tables:", tableErr.message);
      dbTablesExist = false;
    }
  } catch (err: any) {
    console.error("[DB] Database connection failed:", err.message);
    console.error("[DB] Error code:", err.code);
    console.error("[DB] =========================================");
    console.error("[DB] 데이터베이스 연결에 실패했습니다.");
    console.error("[DB] 해결 방법:");
    console.error("[DB] 1. DATABASE_URL 환경 변수를 설정하세요:");
    console.error("[DB]    export DATABASE_URL='postgresql://user:pass@host:port/db?sslmode=require'");
    console.error("[DB] 2. 또는 개별 환경 변수를 설정하세요:");
    console.error("[DB]    export DB_HOST='your-host'");
    console.error("[DB]    export DB_PASSWORD='your-password'");
    console.error("[DB] 3. Render.com 대시보드에서 'External Database URL'을 확인하세요");
    console.error("[DB] =========================================");
    dbConnected = false;
    dbTablesExist = false;
    dbError = err;
  }
})();

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export connection status
export const isDbConnected = () => dbConnected;
export const doTablesExist = () => dbTablesExist;
export const getDbError = () => dbError;
export { pool };

