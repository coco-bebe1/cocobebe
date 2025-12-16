import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      console.log('[posts] GET request');
      const { rows } = await sql`SELECT * FROM posts ORDER BY id DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      console.log('[posts] POST request', req.body);
      const { title, content, author, type } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'title and content required' });
      }
      
      const { rows } = await sql`
        INSERT INTO posts (title, content, author, type) 
        VALUES (${title}, ${content}, ${author || 'Anonymous'}, ${type || 'notice'}) 
        RETURNING *
      `;
      
      console.log('[posts] Insert success', rows[0]);
      return res.status(201).json(rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[posts] Error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Database error' });
  }
}
