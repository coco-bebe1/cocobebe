import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 환경변수 확인
    if (!process.env.DATABASE_URL) {
      console.error('[album-photos] DATABASE_URL not set');
      return res.status(500).json({ 
        error: 'Database connection not configured',
        details: 'DATABASE_URL environment variable is missing'
      });
    }

    // GET: 모든 사진 조회
    if (req.method === 'GET') {
      console.log('[album-photos] GET request');
      
      const { rows } = await sql`
        SELECT * FROM album_photos 
        ORDER BY id DESC
      `;
      
      console.log('[album-photos] GET success, returned', rows.length, 'photos');
      return res.status(200).json(rows);
    }

    // POST: 새로운 사진 추가
    if (req.method === 'POST') {
      console.log('[album-photos] POST request, body:', req.body);
      
      const { title, url } = req.body;
      
      // 입력값 검증
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'title is required and must be a string' });
      }
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'url is required and must be a string' });
      }
      
      console.log('[album-photos] Inserting photo:', { title, url });
      
      // 현재 날짜를 ISO 문자열로
      const currentDate = new Date().toISOString();
      
      const { rows } = await sql`
        INSERT INTO album_photos (title, url, date) 
        VALUES (${title}, ${url}, ${currentDate}) 
        RETURNING *
      `;
      
      const createdPhoto = rows[0];
      console.log('[album-photos] INSERT success:', createdPhoto);
      return res.status(201).json(createdPhoto);
    }

    // DELETE: 사진 삭제
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log('[album-photos] DELETE request, id:', id);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { rows } = await sql`
        DELETE FROM album_photos 
        WHERE id = ${parseInt(id)} 
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      
      console.log('[album-photos] DELETE success');
      return res.status(200).json({ message: 'Photo deleted' });
    }

    // 지원하지 않는 메서드
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[album-photos] ERROR:', {
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
