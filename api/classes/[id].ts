import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = req.query.id as string;
    
    if (req.method === 'PUT') {
      const cls = await storage.updateClass(id, req.body);
      if (!cls) {
        return res.status(404).json({ error: 'Class not found' });
      }
      return res.json(cls);
    }
    
    if (req.method === 'DELETE') {
      const success = await storage.deleteClass(id);
      if (!success) {
        return res.status(404).json({ error: 'Class not found' });
      }
      return res.json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

