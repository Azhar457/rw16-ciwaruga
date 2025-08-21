# 🏘️ Data RT/RW Web App

Aplikasi web untuk manajemen data RT/RW berbasis **Next.js** dengan integrasi **Google Sheets** sebagai database.  
Proyek ini dibuat untuk memudahkan publikasi data UMKM, Loker, Berita, Lembaga, dan BPH RW secara **publik**, sekaligus menyediakan panel admin (NextAuth) untuk manajemen.

---

## 🚀 Fitur
- ✅ Publik Page UMKM (lihat + tambah data)
- ✅ Struktur API terhubung ke Google Sheets
- ✅ Env-based config (mudah setup lokal)
- 🛠️ **Planned**: Login admin (NextAuth), Role management, Upload Foto, Deployment ke Vercel

---

## 📂 Struktur Proyek
```
src/
┣ app/
┃ ┣ api/               # API Routes (Google Sheets handler)
┃ ┃ ┗ umkm/
┃ ┃   ┗ route.ts       # API endpoint UMKM
┃ ┣ umkm/              # Page publik UMKM
┃ ┣ loker/             # Page publik Loker (planned)
┃ ┣ berita/            # Page publik Berita (planned)
┃ ┣ lembaga/           # Page publik Lembaga (planned)
┃ ┗ bph/               # Page publik BPH (planned)
┣ lib/
┃ ┗ googleSheets.ts    # Util koneksi ke Google Sheets
┗ components/          # Reusable UI components (planned)
```

---

## ⚙️ Setup Lokal

### 1. **Clone repo**
```bash
git clone <repo-url>
cd my-app
```

### 2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```



### 4. **Jalankan server**
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🤝 Rules untuk Collaborator

### **Data Access**
- Semua akses data lewat `lib/googleSheets.ts`
- Kalau bikin page baru:
  1. Tambah route API di `/app/api/...`
  2. Connect ke range Google Sheets sesuai sheet
- **Jangan pernah commit `.env.local`** → sudah ada di `.gitignore`

### **Branching Strategy**
- `feature/<nama_fitur>` → untuk fitur baru
- `fix/<bug>` → untuk perbaikan bug  
- PR ke `main` dengan deskripsi singkat

### **Code Style**
- Gunakan TypeScript untuk semua file
- Format dengan Prettier (jika sudah disetup)
- Interface/Type untuk semua data structure

---

## 📋 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/umkm` | Ambil semua data UMKM |
| `POST` | `/api/umkm` | Tambah data UMKM baru |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama_usaha": "Warung Sederhana",
      "jenis_usaha": "Kuliner",
      "alamat": "Jl. Merpati No.10",
      "no_hp": 81234567890,
      "deskripsi": "Warung makan khas Sunda",
      "status_verifikasi": "Verified"
    }
  ]
}
```

---

## 📝 Next Steps

- [ ] Tambah Login Admin (NextAuth)
- [ ] Role-based akses (Admin RW)  
- [ ] Upload Foto (Google Drive/Firebase)
- [ ] Deploy ke Vercel
- [ ] Page untuk Loker, Berita, Lembaga, BPH
- [ ] Dokumentasi lebih detail di Notion / Wiki GitHub

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Google Sheets + Google Apps Script
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js (planned)
- **Deployment**: Vercel (planned)

---

## 📌 Catatan Developer

> **Project ini masih tahap awal (MVP)** → fokus dulu di page publik agar data bisa dilihat masyarakat.
> 
> Setelah semua publik page stabil, baru lanjut ke fitur admin & manajemen data.

---

## 🐛 Troubleshooting

### Error "Missing Google Sheets env variables"
- Pastikan file `.env.local` sudah dibuat
- Restart development server (`Ctrl+C` lalu `npm run dev`)
- Clear Next.js cache: `rmdir /s .next` (Windows)

### Error "umkm.map is not a function"  
- Periksa struktur response dari API
- Pastikan `result.data` adalah array

---

**Made with ❤️ for RT/RW Community**