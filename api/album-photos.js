import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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
      const result = await pool.query('SELECT * FROM album_photos ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { title, url } = req.body;
      if (!title || !url) {
        return res.status(400).json({ error: 'title and url required' });
      }
      
      const result = await pool.query(
        'INSERT INTO album_photos (title, url) VALUES ($1, $2) RETURNING *',
        [title, url]
      );
      
      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
}
