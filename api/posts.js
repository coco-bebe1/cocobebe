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
      const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const { title, content, author, type } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: 'title and content required' });
      }
      
      const result = await pool.query(
        'INSERT INTO posts (title, content, author, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, content, author || 'Anonymous', type || 'notice']
      );
      
      return res.status(201).json(result.rows[0]);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
}
