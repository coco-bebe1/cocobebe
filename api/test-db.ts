import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../server/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variable
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: 'DATABASE_URL environment variable is not set',
        hint: 'Please set DATABASE_URL in Vercel dashboard → Settings → Environment Variables'
      });
    }

    // Test database connection
    const result = await pool.query('SELECT 1 as test, NOW() as current_time');
    
    return res.json({ 
      success: true, 
      message: 'Database connection successful',
      test: result.rows[0],
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set'
    });
  } catch (error: any) {
    console.error('[API] Test DB error:', error);
    return res.status(500).json({ 
      error: error.message || 'Database connection failed',
      details: error.code,
      hint: 'Check Vercel Functions logs for more details'
    });
  }
}

