import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 환경변수 확인
    if (!process.env.DATABASE_URL) {
      console.error('[posts] DATABASE_URL not set');
      return res.status(500).json({ 
        error: 'Database connection not configured',
        details: 'DATABASE_URL environment variable is missing'
      });
    }

    // GET: 모든 글 조회
    if (req.method === 'GET') {
      console.log('[posts] GET request');
      
      const { rows } = await sql`
        SELECT * FROM posts 
        ORDER BY id DESC
      `;
      
      console.log('[posts] GET success, returned', rows.length, 'posts');
      return res.status(200).json(rows);
    }

    // POST: 새로운 글 추가
    if (req.method === 'POST') {
      console.log('[posts] POST request, body:', req.body);
      
      const { title, content, author, type } = req.body;
      
      // 입력값 검증
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'title is required and must be a string' });
      }
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'content is required and must be a string' });
      }
      
      const authorValue = author || 'Anonymous';
      const typeValue = type || 'notice';
      
      console.log('[posts] Inserting post:', { title, author: authorValue, type: typeValue });
      
      // 현재 날짜를 ISO 문자열로
      const currentDate = new Date().toISOString();
      
      const { rows } = await sql`
        INSERT INTO posts (title, content, author, type, date) 
        VALUES (${title}, ${content}, ${authorValue}, ${typeValue}, ${currentDate}) 
        RETURNING *
      `;
      
      const createdPost = rows[0];
      console.log('[posts] INSERT success:', createdPost);
      return res.status(201).json(createdPost);
    }

    // PUT: 글 수정
    if (req.method === 'PUT') {
      const { id } = req.query;
      console.log('[posts] PUT request, id:', id, 'body:', req.body);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { title, content, author, type } = req.body;
      
      if (!title && !content && !author && !type) {
        return res.status(400).json({ error: 'At least one field is required to update' });
      }
      
      const { rows } = await sql`
        UPDATE posts 
        SET title = COALESCE(${title || null}, title),
            content = COALESCE(${content || null}, content),
            author = COALESCE(${author || null}, author),
            type = COALESCE(${type || null}, type)
        WHERE id = ${parseInt(id)}
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      console.log('[posts] UPDATE success');
      return res.status(200).json(rows[0]);
    }

    // DELETE: 글 삭제
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log('[posts] DELETE request, id:', id);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { rows } = await sql`
        DELETE FROM posts 
        WHERE id = ${parseInt(id)} 
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      console.log('[posts] DELETE success');
      return res.status(200).json({ message: 'Post deleted' });
    }

    // 지원하지 않는 메서드
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[posts] ERROR:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // 데이터베이스 연결 오류
    if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: 'Cannot connect to PostgreSQL database'
      });
    }
    
    // 기타 에러
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
}
