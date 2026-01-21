# moonlay technologies - make IT works

**Front-End & Back-End Developer Intern**


**Technical Test** 

**Test Project: Simple Task Management App** 

### Deskripsi Singkat

Buatlah aplikasi Task Management sederhana yang memungkinkan user menambah, mengedit, menghapus, dan melihat daftar task .

Setiap task minimal memiliki:

* Judul 


* Deskripsi 


* Status (misal: Todo, In Progress, Done) 


* Deadline 


* Assignee (penanggung jawab task, berupa nama user) 



---

Ketentuan Teknis 

1. Frontend 

* 
**Framework:** React (Next.js) 


* 
**Fitur:** 


* Login sederhana (boleh hardcode user).


* Melihat daftar seluruh task.


* Menambah, mengedit, dan menghapus task.


* Mengubah status task.


* Memilih assignee untuk setiap task (dropdown dari daftar user yang diget dari api).


* UI/UX minimalis dan user-friendly.





2. Backend 

* Gunakan salah satu:


* Python (FastAPI/Flask) 


* atau Golang (Gin/Echo/Fiber) 




* 
**Fitur:** 


* Endpoint CRUD untuk task.


* Autentikasi sederhana (JWT).


* Semua data tersimpan di PostgreSQL.


* Endpoint untuk mendapatkan daftar user (assignee).





3. Database 

* 
**PostgreSQL** 


* Rancang skema tabel yang sesuai kebutuhan aplikasi, termasuk tabel user dan relasinya ke assignee pada task.



4. Dokumentasi 

* 
**API:** Dokumentasikan seluruh endpoint menggunakan Postman (sertakan collection & contoh request/response).


* 
**ERD:** Buat Entity Relationship Diagram (pakai tool diagram online, misal dbdiagram.io/draw.io).



---

Bonus Penilaian (Opsional, Nilai Plus) 

Tambahkan fitur AI Chatbot yang dapat menjawab pertanyaan seputar data task di aplikasi, seperti:

* "Tampilkan semua task yang statusnya belum selesai." 


* "Berapa jumlah task yang sudah selesai?" 


* "Tugas apa saja yang deadlinenya hari ini?" 


* "Siapa assignee dari task [judul task]?" 



**Ketentuan Bonus:**

* Chatbot menggunakan LLM (OpenAI/Gemini/model open-source).


* Integrasikan chatbot ke aplikasi (backend).


* Penjelasan cara kerja chatbot, library/model yang dipakai, dan cara menjalankan fitur chatbot wajib ada di README.



---

Deliverables (Yang Dikumpulkan) 

1. Source code frontend (Next.js) dan backend (Python/Golang).


2. File Postman Collection untuk dokumentasi API.


3. File ERD (PDF/JPG/PNG).


4. Instruksi singkat untuk menjalankan project (README.md).


5. Jika mengerjakan AI chatbot: Penjelasan di README tentang cara kerja chatbot dan cara menjalankan fiturnya .



---

Kriteria Penilaian 

* Fungsionalitas aplikasi (CRUD berjalan baik).


* Query ke database PostgreSQL berjalan baik.


* Struktur kode (rapi, modular, readable).


* Kualitas dokumentasi API (jelas, lengkap, dan dapat dicoba via Postman).


* Kesesuaian ERD dengan kebutuhan aplikasi.


* 
**Bonus:** Integrasi AI chatbot yang dapat menjawab pertanyaan terkait data aplikasi .

---

## Cara Menjalankan Proyek

### Prasyarat
- Node.js 18+ & npm
- Python 3.10+
- PostgreSQL berjalan (default: `postgres:postgres@localhost:5432/task_db`)

### Backend (FastAPI)
1. Pindah ke folder backend dan buat virtualenv (opsional):
   - `cd backend`
   - `python -m venv .venv && .\\.venv\\Scripts\\activate` (Windows)
2. Instal dependensi: `pip install -r requirements.txt`
3. Salin `.env.example` menjadi `.env` dan isi nilai:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_db`
   - `JWT_SECRET` isi nilai rahasia
   - `DEEPSEEK_API_KEY` isi API key
4. Jalankan migrasi sederhana (create_all) otomatis saat start; seed demo user (opsional):
   - `python seed.py`
5. Start server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend (Next.js)
1. `cd frontend`
2. `npm install`
3. Salin `.env.example` menjadi `.env.local` dan sesuaikan `NEXT_PUBLIC_API_BASE=http://localhost:8000`
4. Jalankan: `npm run dev` (default http://localhost:3000)

### Login Demo
- Email: `admin@example.com`
- Password: `admin123`

---

## Struktur Utama
- `backend/` FastAPI + SQLAlchemy + JWT + DeepSeek chatbot
- `frontend/` Next.js app router, CRUD UI, chatbot panel
- `docs/postman_collection.json` Postman collection
- `docs/erd.md` Mermaid ERD (export ke PNG/PDF sesuai kebutuhan)

---

## DeepSeek Chatbot
- Endpoint: `POST /chat/query` dengan payload `{ "question": "..." }`
- Konfigurasi:
  - `DEEPSEEK_API_KEY` dan opsional `DEEPSEEK_API_URL`
  - Model yang digunakan: `deepseek-chat`
- Mekanisme: backend mengambil task terkait (opsional filter status), membangun prompt ringkas, memanggil DeepSeek API, lalu mengembalikan jawaban teks.

---

## Troubleshooting

### Error saat Login/Register (bcrypt)
**Masalah:** Jika muncul error seperti `AttributeError: module 'bcrypt' has no attribute '__about__'` atau error terkait hashing password.

**Penyebab:** Versi `bcrypt==4.0.1` tidak kompatibel dengan `passlib==1.7.4`. API bcrypt berubah di versi 4.x yang menyebabkan passlib tidak dapat menggunakan bcrypt dengan benar.

**Solusi:** Gunakan `bcrypt==3.2.2` di `requirements.txt`:
```
passlib[bcrypt]==1.7.4
bcrypt==3.2.2
```
Lalu install ulang: `pip install -r requirements.txt`

---

## Catatan API
- Auth: `POST /auth/login` (form username=email, password)
- Task CRUD: `/tasks` (GET/POST), `/tasks/{id}` (GET/PUT/DELETE)
- Users: `/users` (GET, POST)
- Chatbot: `/chat/query`

Import Postman collection: `docs/postman_collection.json`, set `baseUrl` dan `token` (Bearer).
