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
      console.error('[teachers] DATABASE_URL not set');
      return res.status(500).json({ 
        error: 'Database connection not configured',
        details: 'DATABASE_URL environment variable is missing'
      });
    }

    // GET: 모든 선생님 조회
    if (req.method === 'GET') {
      console.log('[teachers] GET request');
      
      const { rows } = await sql`
        SELECT * FROM teachers 
        ORDER BY id DESC
      `;
      
      console.log('[teachers] GET success, returned', rows.length, 'teachers');
      return res.status(200).json(rows);
    }

    // POST: 새로운 선생님 등록
    if (req.method === 'POST') {
      console.log('[teachers] POST request, body:', req.body);
      
      const { name, username, password, phone, classId, photoUrl } = req.body;
      
      // 입력값 검증
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'name is required and must be a string' });
      }
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'username is required and must be a string' });
      }
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'password is required and must be a string' });
      }
      if (!classId || typeof classId !== 'string') {
        return res.status(400).json({ error: 'classId is required and must be a string' });
      }
      
      console.log('[teachers] Inserting teacher:', { name, username, classId });
      
      try {
        const { rows } = await sql`
          INSERT INTO teachers (name, username, password, phone, class_id, approved, photo_url) 
          VALUES (${name}, ${username}, ${password}, ${phone || null}, ${classId}, false, ${photoUrl || null}) 
          RETURNING *
        `;
        
        const createdTeacher = rows[0];
        console.log('[teachers] INSERT success:', createdTeacher);
        return res.status(201).json(createdTeacher);
      } catch (insertError) {
        console.error('[teachers] Insert error:', insertError.message);
        
        // username이 이미 존재하는 경우
        if (insertError.message?.includes('duplicate key') || insertError.code === '23505') {
          return res.status(409).json({ error: 'Username already exists' });
        }
        
        throw insertError;
      }
    }

    // PUT: 선생님 정보 수정
    if (req.method === 'PUT') {
      const { id } = req.query;
      console.log('[teachers] PUT request, id:', id, 'body:', req.body);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { name, phone, approved, photoUrl } = req.body;
      
      if (!name && !phone && approved === undefined && !photoUrl) {
        return res.status(400).json({ error: 'At least one field is required to update' });
      }
      
      const { rows } = await sql`
        UPDATE teachers 
        SET name = COALESCE(${name || null}, name),
            phone = COALESCE(${phone || null}, phone),
            approved = COALESCE(${approved !== undefined ? approved : null}, approved),
            photo_url = COALESCE(${photoUrl || null}, photo_url)
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      
      console.log('[teachers] UPDATE success');
      return res.status(200).json(rows[0]);
    }

    // DELETE: 선생님 삭제
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log('[teachers] DELETE request, id:', id);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { rows } = await sql`
        DELETE FROM teachers 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      
      console.log('[teachers] DELETE success');
      return res.status(200).json({ message: 'Teacher deleted' });
    }

    // 지원하지 않는 메서드
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[teachers] ERROR:', {
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
