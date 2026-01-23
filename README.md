# Task Management App

Aplikasi Task Management sederhana berbasis web yang memungkinkan pengelolaan tugas dengan fitur CRUD lengkap, autentikasi pengguna, dan AI Chatbot terintegrasi.

## 📋 Fitur Utama

- ✅ **Autentikasi**: Login dengan JWT token
- 📝 **CRUD Tasks**: Create, Read, Update, Delete task
- 👥 **Assignee Management**: Assign task ke user tertentu
- 🔄 **Status Management**: Todo, In Progress, Done
- 📅 **Deadline Tracking**: Set dan monitor deadline task
- 🤖 **AI Chatbot**: Tanya jawab seputar data task menggunakan LLM
- 📊 **Kanban Board Layout**: Tampilan ala Jira untuk visualisasi task

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: CSS Modules + Styled JSX
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI Components**: Custom components dengan Jira-inspired design

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **AI Integration**: DeepSeek API (httpx)

### Database
- **PostgreSQL 14+**
- Tabel: `users`, `tasks`
- Relasi: Foreign Key (`tasks.assignee_id` → `users.id`)

## 📁 Struktur Project

```
Task_Management_Moonlay/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # Entry point FastAPI
│   │   ├── config.py            # Config & environment
│   │   ├── db.py                # Database connection
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── deps.py              # Dependencies (auth, DB)
│   │   ├── core/
│   │   │   ├── config.py        # Settings class
│   │   │   └── security.py      # JWT & password hashing
│   │   ├── routers/
│   │   │   ├── auth.py          # Login endpoint
│   │   │   ├── tasks.py         # CRUD Tasks
│   │   │   ├── users.py         # Get users
│   │   │   └── chat.py          # Chatbot endpoint
│   │   └── services/
│   │       └── chatbot.py       # AI chatbot logic
│   ├── requirements.txt
│   └── env.example
├── frontend/
│   ├── app/
│   │   ├── page.js              # Dashboard (main)
│   │   ├── login/page.js        # Login page
│   │   └── layout.js            # Root layout
│   ├── components/
│   │   ├── TaskList.js          # Kanban board
│   │   ├── TaskForm.js          # Form create/edit
│   │   └── ChatbotPanel.js      # Floating chatbot
│   ├── lib/api.js               # Axios instance
│   ├── styles/globals.css
│   └── package.json
└── docs/
    ├── erd.md                    # ERD diagram
    └── postman_collection.json   # API documentation
```

## 🚀 Cara Menjalankan Project

### Prerequisites
- Node.js 18+ dan npm/yarn
- Python 3.10+
- PostgreSQL 14+
- (Opsional) DeepSeek API Key untuk fitur chatbot

### 1. Setup Database

```bash
# Buat database PostgreSQL
createdb task_db

# Atau via psql:
psql -U postgres
CREATE DATABASE task_db;
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy dan edit environment variables
cp env.example .env

# Edit .env dengan konfigurasi Anda:
# DATABASE_URL=postgresql+psycopg2://postgres:PASSWORD@localhost:5432/task_db
# JWT_SECRET=your_secret_key_here
# DEEPSEEK_API_KEY=your_deepseek_api_key  # (optional, untuk chatbot)

# Jalankan seeder untuk data awal (user & sample tasks)
python seed.py

# Jalankan server
uvicorn app.main:app --reload
```

Backend akan berjalan di **http://localhost:8000**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di **http://localhost:3000**

### 4. Login ke Aplikasi

Gunakan kredensial default dari seeder:

- **Email**: `admin@example.com`
- **Password**: `admin123`

## 🤖 Fitur AI Chatbot (Bonus)

### Cara Kerja

AI Chatbot menggunakan **DeepSeek API** (LLM open-source) untuk menjawab pertanyaan seputar data task di aplikasi.

**Arsitektur:**
1. User mengirim pertanyaan via UI floating chatbot
2. Frontend POST request ke `/chat/query/`
3. Backend:
   - Query semua task dari database PostgreSQL
   - Format data task menjadi context string
   - Kirim prompt + context ke DeepSeek API
   - Return jawaban AI ke frontend
4. Frontend menampilkan jawaban dengan Markdown formatting

**Library yang Digunakan:**
- **httpx**: HTTP client untuk request ke DeepSeek API
- **SQLAlchemy**: Query data task dari PostgreSQL
- **react-markdown**: Render response chatbot di frontend

### Contoh Pertanyaan yang Bisa Dijawab:

- "Tampilkan semua task yang statusnya belum selesai"
- "Berapa jumlah task yang sudah done?"
- "Task apa saja yang deadlinenya hari ini?"
- "Siapa assignee dari task [judul task]?"
- "Task yang terlambat ada berapa?"
- "Tampilkan task yang dikerjakan oleh [nama user]"

### Cara Mengaktifkan Chatbot:

1. Daftar akun di [DeepSeek](https://platform.deepseek.com)
2. Generate API Key
3. Tambahkan ke `.env` di backend:
   ```
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxx
   DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
   ```
4. Restart backend server
5. Klik icon chat (pojok kiri bawah) di frontend

**Note**: Jika API key tidak diset, chatbot akan return error message.

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login dan dapatkan JWT token |
| GET | `/users/` | ✅ | List semua users |
| GET | `/tasks/` | ✅ | List semua tasks |
| POST | `/tasks/` | ✅ | Create task baru |
| PUT | `/tasks/{id}` | ✅ | Update task by ID |
| DELETE | `/tasks/{id}` | ✅ | Delete task by ID |
| POST | `/chat/query/` | ✅ | Query AI chatbot |

### Contoh Request/Response

Lihat file **`docs/postman_collection.json`** untuk dokumentasi lengkap.

**Cara pakai:**
1. Buka Postman
2. Import → Upload `docs/postman_collection.json`
3. Set variable `baseUrl` = `http://localhost:8000`
4. Run request "Auth - Login" dulu untuk dapat token
5. Copy token ke variable `{{token}}`
6. Test endpoint lainnya

## 🗄 Database Schema (ERD)

Lihat file **`docs/erd.md`** atau diagram berikut:

**Tabel Users:**
- `id` (PK, Integer)
- `email` (String, Unique)
- `name` (String)
- `hashed_password` (String)
- `created_at` (DateTime)

**Tabel Tasks:**
- `id` (PK, Integer)
- `title` (String)
- `description` (Text)
- `status` (Enum: Todo, In Progress, Done)
- `deadline` (DateTime, nullable)
- `assignee_id` (FK → users.id)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Relasi:**
- One-to-Many: `users` ← `tasks` (via `assignee_id`)

## 📝 Catatan Teknis

- **JWT Token Expiry**: 60 menit (configurable di `.env`)
- **CORS**: Frontend default `http://localhost:3000` (edit di `backend/app/main.py`)
- **Database Migration**: Gunakan `alembic` jika perlu (saat ini auto-create via SQLAlchemy)
- **Seeder**: `backend/seed.py` membuat 3 user dummy dan beberapa sample tasks

## 📦 Deliverables

✅ Source code (frontend + backend)  
✅ API Documentation (Postman Collection)  
✅ ERD Diagram  
✅ README dengan instruksi lengkap  
✅ AI Chatbot terintegrasi dengan penjelasan cara kerja

---

**Last Updated**: January 2026
