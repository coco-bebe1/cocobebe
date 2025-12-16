import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.error('[API] DATABASE_URL environment variable is not set');
      return res.status(500).json({ 
        error: 'Database configuration error. Please set DATABASE_URL environment variable.' 
      });
    }

    if (req.method === 'GET') {
      const posts = await storage.getPosts();
      return res.json(posts);
    }
    
    if (req.method === 'POST') {
      console.log('[API] POST /api/posts - Request body:', JSON.stringify(req.body));
      
      if (!req.body || !req.body.title || !req.body.content) {
        return res.status(400).json({ error: 'title and content are required' });
      }
      
      const post = await storage.addPost(req.body);
      console.log('[API] Post added successfully:', post.id);
      return res.json(post);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API] Error in /api/posts:', error);
    console.error('[API] Error stack:', error?.stack);
    console.error('[API] Error message:', error?.message);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

