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
      console.error('[classes] DATABASE_URL not set');
      return res.status(500).json({ 
        error: 'Database connection not configured',
        details: 'DATABASE_URL environment variable is missing'
      });
    }

    // GET: 모든 반 조회
    if (req.method === 'GET') {
      console.log('[classes] GET request');
      
      const { rows } = await sql`
        SELECT * FROM classes 
        ORDER BY age ASC
      `;
      
      console.log('[classes] GET success, returned', rows.length, 'classes');
      return res.status(200).json(rows);
    }

    // POST: 새로운 반 추가
    if (req.method === 'POST') {
      console.log('[classes] POST request, body:', req.body);
      
      const { name, age, teacher, color, description, schedule } = req.body;
      
      // 입력값 검증
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'name is required and must be a string' });
      }
      if (!age || typeof age !== 'string') {
        return res.status(400).json({ error: 'age is required and must be a string' });
      }
      if (!teacher || typeof teacher !== 'string') {
        return res.status(400).json({ error: 'teacher is required and must be a string' });
      }
      if (!color || typeof color !== 'string') {
        return res.status(400).json({ error: 'color is required and must be a string' });
      }
      if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'description is required and must be a string' });
      }
      if (!schedule || !Array.isArray(schedule)) {
        return res.status(400).json({ error: 'schedule is required and must be an array' });
      }
      
      console.log('[classes] Inserting class:', { name, age, teacher });
      
      const { rows } = await sql`
        INSERT INTO classes (name, age, teacher, color, description, schedule) 
        VALUES (${name}, ${age}, ${teacher}, ${color}, ${description}, ${JSON.stringify(schedule)}) 
        RETURNING *
      `;
      
      const createdClass = rows[0];
      console.log('[classes] INSERT success:', createdClass);
      return res.status(201).json(createdClass);
    }

    // PUT: 반 정보 수정
    if (req.method === 'PUT') {
      const { id } = req.query;
      console.log('[classes] PUT request, id:', id, 'body:', req.body);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { name, age, teacher, color, description, schedule } = req.body;
      
      if (!name && !age && !teacher && !color && !description && !schedule) {
        return res.status(400).json({ error: 'At least one field is required to update' });
      }
      
      const { rows } = await sql`
        UPDATE classes 
        SET name = COALESCE(${name || null}, name),
            age = COALESCE(${age || null}, age),
            teacher = COALESCE(${teacher || null}, teacher),
            color = COALESCE(${color || null}, color),
            description = COALESCE(${description || null}, description),
            schedule = COALESCE(${schedule ? JSON.stringify(schedule) : null}, schedule)
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      
      console.log('[classes] UPDATE success');
      return res.status(200).json(rows[0]);
    }

    // DELETE: 반 삭제
    if (req.method === 'DELETE') {
      const { id } = req.query;
      console.log('[classes] DELETE request, id:', id);
      
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }
      
      const { rows } = await sql`
        DELETE FROM classes 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      
      console.log('[classes] DELETE success');
      return res.status(200).json({ message: 'Class deleted' });
    }

    // 지원하지 않는 메서드
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('[classes] ERROR:', {
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
