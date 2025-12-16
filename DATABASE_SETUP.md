# 데이터베이스 연결 설정 가이드

## 필요한 정보

Render.com PostgreSQL 데이터베이스에 연결하려면 다음 정보가 필요합니다:

### 방법 1: External Database URL 사용 (권장)

Render.com 대시보드에서 **"External Database URL"** 전체를 복사하세요.

형식: `postgresql://username:password@hostname:port/database?sslmode=require`

이 URL을 환경 변수로 설정:
```bash
export DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

### 방법 2: 개별 정보 사용

Render.com 대시보드에서 다음 정보를 확인하세요:

1. **Hostname** (외부 접근용)
   - 예: `dpg-xxxxx.oregon-postgres.render.com`
   - 또는 `dpg-xxxxx.frankfurt-postgres.render.com` 등

2. **Port**
   - 일반적으로 `5432`

3. **Database Name**
   - 예: `cocobebe_owr7`

4. **Username**
   - 예: `cocobebe_owr7_user`

5. **Password**
   - ⚠️ 정확한 비밀번호 확인 필요

6. **Region** (리전)
   - oregon, frankfurt, singapore, ohio, ireland 등

## 환경 변수 설정

### 터미널에서 설정 (임시)
```bash
export DATABASE_URL="여기에_External_Database_URL_붙여넣기"
```

### 영구 설정 (.env 파일 사용)

프로젝트 루트에 `.env` 파일을 생성하고:
```
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

또는 개별 변수:
```
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=cocobebe_owr7
DB_USER=cocobebe_owr7_user
DB_PASSWORD=실제_비밀번호
```

## 확인 방법

1. Render.com 대시보드 → PostgreSQL 데이터베이스 선택
2. "Connections" 탭 또는 "Info" 탭 확인
3. **"External Database URL"** 또는 **"Connection String"** 복사

## 주의사항

- Internal Database URL은 Render.com 내부에서만 사용 가능합니다
- External Database URL을 사용해야 외부에서 접근 가능합니다
- SSL 연결이 필요하므로 `?sslmode=require`가 포함되어야 합니다

