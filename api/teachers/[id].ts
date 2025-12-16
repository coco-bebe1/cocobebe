import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = req.query.id as string;
    
    if (req.method === 'PUT') {
      const teacher = await storage.updateTeacher(id, req.body);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      return res.json(teacher);
    }
    
    if (req.method === 'DELETE') {
      const success = await storage.deleteTeacher(id);
      if (!success) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      return res.json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

