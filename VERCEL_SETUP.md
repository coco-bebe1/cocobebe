# Vercel 배포 설정 가이드

## 환경 변수 설정 (필수)

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

1. Vercel 대시보드 → 프로젝트 선택 → Settings → Environment Variables
2. 다음 변수 추가:

```
DATABASE_URL = postgresql://cocobebe_2s46_user:AhUhpJ0JSwNrcNcvMzlybL6iDYRxpgx4@dpg-d4vo1ehr0fns739pgqe0-a.singapore-postgres.render.com:5432/cocobebe_2s46?sslmode=require
```

3. Environment: Production, Preview, Development 모두 선택
4. Save 후 재배포

## 배포 후 확인

배포가 완료되면:
- `https://your-project.vercel.app/api/test-db` 접속하여 데이터베이스 연결 확인
- 관리자 페이지에서 글/사진/선생님 추가 테스트

## 문제 해결

만약 여전히 500 에러가 발생하면:
1. Vercel 대시보드 → Functions 탭에서 에러 로그 확인
2. 환경 변수가 제대로 설정되었는지 확인
3. 데이터베이스 연결이 정상인지 확인

