# Vercel 배포 문제 해결 가이드

## 문제: 로컬에서는 작동하지만 Vercel에서는 데이터베이스 연결 실패

### 원인
로컬에서는:
- `npm run dev`로 백엔드 서버(포트 5000) 실행
- `npm run dev:client`로 프론트엔드(포트 3000) 실행
- Vite proxy가 `/api/*` 요청을 `http://localhost:5000`으로 프록시

Vercel에서는:
- 정적 파일만 배포 (`docs` 폴더)
- API는 서버리스 함수로 작동해야 함
- 환경 변수 `DATABASE_URL`이 설정되어야 함

## 해결 방법

### 1. Vercel 환경 변수 확인 (가장 중요!)

1. Vercel 대시보드 → `cocobebe-nursery` 프로젝트
2. **Settings** → **Environment Variables**
3. 다음 변수가 있는지 확인:
   ```
   Name: DATABASE_URL
   Value: postgresql://cocobebe_2s46_user:AhUhpJ0JSwNrcNcvMzlybL6iDYRxpgx4@dpg-d4vo1ehr0fns739pgqe0-a.singapore-postgres.render.com:5432/cocobebe_2s46?sslmode=require
   ```
4. **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭

### 2. 서버리스 함수 배포 확인

1. Vercel 대시보드 → **Functions** 탭
2. 다음 함수들이 보이는지 확인:
   - `/api/posts`
   - `/api/album-photos`
   - `/api/teachers`
   - `/api/users`
   - `/api/classes`
   - `/api/registered-children`
   - `/api/site-settings`

### 3. 에러 로그 확인

1. Vercel 대시보드 → **Functions** 탭
2. 각 함수를 클릭하여 로그 확인
3. 에러 메시지 확인:
   - `DATABASE_URL environment variable is not set` → 환경 변수 미설정
   - `Database connection failed` → 데이터베이스 연결 실패
   - `relation "posts" does not exist` → 테이블이 없음 (마이그레이션 필요)

### 4. 재배포

환경 변수를 설정한 후:
1. **Deployments** 탭
2. 최신 배포 선택
3. **Redeploy** 클릭
4. 또는 GitHub에 푸시하여 자동 재배포

### 5. 데이터베이스 테이블 확인

테이블이 없으면:
```bash
DATABASE_URL="postgresql://..." npm run db:push
```

또는 Vercel CLI 사용:
```bash
vercel env pull .env.local
DATABASE_URL="..." npm run db:push
```

## 테스트 방법

배포 후 다음 URL로 테스트:
- `https://cocobebe-nursery.vercel.app/api/posts` (GET)
- `https://cocobebe-nursery.vercel.app/api/test-db` (있으면)

브라우저 콘솔에서 네트워크 탭 확인:
- `/api/*` 요청이 500 에러인지 확인
- 에러 메시지 확인

