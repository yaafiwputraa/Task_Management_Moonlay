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
