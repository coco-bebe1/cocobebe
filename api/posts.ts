import { db } from '../server/db';
import { posts } from '../shared/schema';
import { desc } from 'drizzle-orm';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const allPosts = await db.select().from(posts).orderBy(desc(posts.id));
      return res.status(200).json(allPosts);
    }

    if (req.method === 'POST') {
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({ error: 'title and content required' });
      }
      
      const newPost = await db.insert(posts).values({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author || 'Anonymous',
        type: req.body.type || 'notice',
      }).returning();
      
      return res.status(201).json(newPost[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
