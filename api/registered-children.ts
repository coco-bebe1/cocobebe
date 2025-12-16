import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: 'Database configuration error. Please set DATABASE_URL environment variable.' 
      });
    }

    if (req.method === 'GET') {
      const children = await storage.getRegisteredChildren();
      return res.json(children);
    }
    
    if (req.method === 'POST') {
      const child = await storage.addRegisteredChild(req.body);
      return res.json(child);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API] Error in /api/registered-children:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
}

