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
      const photos = await storage.getAlbumPhotos();
      return res.json(photos);
    }
    
    if (req.method === 'POST') {
      console.log('[API] POST /api/album-photos - Request body:', JSON.stringify(req.body));
      
      if (!req.body || !req.body.title || !req.body.url) {
        return res.status(400).json({ error: 'title and url are required' });
      }
      
      const photo = await storage.addAlbumPhoto(req.body);
      console.log('[API] Photo added successfully:', photo.id);
      return res.json(photo);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API] Error in /api/album-photos:', error);
    console.error('[API] Error stack:', error?.stack);
    console.error('[API] Error message:', error?.message);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

