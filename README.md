# 🥕 당근마켓 클론

당근마켓을 참고하여 만든 중고거래 웹 앱입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 18, Vite, TailwindCSS, Zustand, React Router, Axios, Socket.io-client |
| **Backend** | Node.js, Express, Prisma ORM, SQLite, JWT, Socket.io, Multer |
| **인프라** | Docker, Docker Compose |

## 주요 기능

- **회원가입 / 로그인** — JWT 기반 인증
- **상품 목록** — 카테고리 필터, 키워드 검색, 페이지네이션
- **상품 등록** — 이미지 최대 10장 업로드
- **상품 상세** — 좋아요, 판매 상태 변경 (판매중 / 예약중 / 거래완료)
- **실시간 채팅** — Socket.io 기반 1:1 채팅
- **프로필** — 매너온도, 판매 상품 목록, 관심 목록

## 프로젝트 구조

```
practice2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB 스키마
│   │   ├── seed.js             # 테스트 데이터
│   │   └── migrations/
│   └── src/
│       ├── app.js              # 서버 진입점
│       ├── socket/             # Socket.io 실시간 채팅
│       ├── middleware/         # JWT 인증, 이미지 업로드
│       ├── controllers/        # 비즈니스 로직
│       └── routes/             # API 라우팅
├── frontend/
│   └── src/
│       ├── api/                # Axios API 클라이언트
│       ├── store/              # Zustand 전역 상태
│       ├── components/         # 공통 컴포넌트
│       └── pages/              # 페이지 컴포넌트
└── docker-compose.yml
```

## 시작하기

### 요구사항

- Node.js 18+
- npm

### 로컬 실행

**1. 백엔드**

```bash
cd backend
npm install

# .env 파일 생성
cp .env.example .env

# DB 마이그레이션 및 테스트 데이터 삽입
npx prisma migrate dev
node prisma/seed.js

# 서버 시작
npm run dev
```

**2. 프론트엔드** (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

| 서비스 | 주소 |
|--------|------|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 API | http://localhost:4000 |

### Docker로 실행 (PostgreSQL)

`.env.example`을 참고해 `backend/.env`를 설정한 뒤:

```bash
docker-compose up
```

## 테스트 계정

| 이메일 | 비밀번호 | 닉네임 |
|--------|----------|--------|
| test1@karrot.com | password123 | 당근이 |
| test2@karrot.com | password123 | 토끼 |

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 내 정보 조회 |
| GET | `/api/products` | 상품 목록 |
| POST | `/api/products` | 상품 등록 |
| GET | `/api/products/:id` | 상품 상세 |
| PUT | `/api/products/:id` | 상품 수정 |
| DELETE | `/api/products/:id` | 상품 삭제 |
| POST | `/api/products/:id/like` | 좋아요 토글 |
| POST | `/api/chat/rooms` | 채팅방 생성/조회 |
| GET | `/api/chat/rooms` | 내 채팅방 목록 |
| GET | `/api/chat/rooms/:roomId/messages` | 메시지 목록 |
| GET | `/api/users/:id` | 유저 프로필 |
| PUT | `/api/users/me` | 프로필 수정 |
| GET | `/api/users/me/products` | 내 판매 상품 |
| GET | `/api/users/me/likes` | 관심 목록 |

## DB 스키마

```
User ─── Product ─── Like
  │          │
  │       ChatRoom ─── Message
  │
Review
```
