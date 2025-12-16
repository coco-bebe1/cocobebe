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
      console.log('[album-photos] GET request');
      const { rows } = await sql`SELECT * FROM album_photos ORDER BY id DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      console.log('[album-photos] POST request', req.body);
      const { title, url } = req.body;
      if (!title || !url) {
        return res.status(400).json({ error: 'title and url required' });
      }
      
      const { rows } = await sql`
        INSERT INTO album_photos (title, url) 
        VALUES (${title}, ${url}) 
        RETURNING *
      `;
      
      console.log('[album-photos] Insert success', rows[0]);
      return res.status(201).json(rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[album-photos] Error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Database error' });
  }
}
