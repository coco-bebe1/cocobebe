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
      const teachers = await storage.getTeachers();
      return res.json(teachers);
    }
    
    if (req.method === 'POST') {
      console.log('[API] POST /api/teachers - Request body:', JSON.stringify(req.body));
      
      if (!req.body || !req.body.name || !req.body.username || !req.body.password || !req.body.classId) {
        return res.status(400).json({ error: 'name, username, password, and classId are required' });
      }
      
      const teacher = await storage.addTeacher(req.body);
      console.log('[API] Teacher added successfully:', teacher.id);
      return res.json(teacher);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API] Error in /api/teachers:', error);
    console.error('[API] Error stack:', error?.stack);
    console.error('[API] Error message:', error?.message);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

