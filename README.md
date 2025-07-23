# EcoWatcher

EcoWatcher adalah aplikasi untuk monitoring lingkungan yang terdiri dari aplikasi mobile dan web dashboard admin.

## 🚀 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd ecowatcher
```

### 2. Konfigurasi IP Address

Sebelum menjalankan aplikasi, Anda perlu mengonfigurasi IP Address:

1. Dapatkan IP Address lokal Anda:
   ```bash
   # Pada Windows (CMD/PowerShell)
   ipconfig
   
   # Pada macOS/Linux
   ifconfig
   ```

2. Salin IPv4 Address yang ditampilkan

3. Update konfigurasi:
   - Buka file app/config.ts di folder ecowatcher
   - Ganti IP Address dengan IPv4 Address yang telah Anda salin

### 3. Install Dependencies

Install dependencies untuk semua komponen aplikasi:

```bash
# Install dependencies untuk EcoWatcher (Mobile App)
cd ecowatcher
npm install

# Install dependencies untuk Admin Dashboard
cd ../EcoWatcher-Web
npm install
```

## 🏃‍♂️ Menjalankan Aplikasi

### Mobile App (EcoWatcher)
```bash
cd ecowatcher
# Pilih salah satu command berikut:
npx expo start
# atau
npm start
```

### Backend Server
```bash
cd ecowatcher/backend
node server.js
```

### Web Dashboard (Admin)
```bash
cd EcoWatcher-Web
npm run dev
```

## 🏗️ Struktur Proyek

```
ecowatcher/
├── app/
│   └── config.ts          # Konfigurasi IP Address
├── backend/
│   └── server.js          # Server backend
└── ...

EcoWatcher-Web/
├── src/
└── ...
```

## 🔧 Konfigurasi

### config.ts
File konfigurasi utama yang berisi:
- IP Address server backend
- Port aplikasi
- Endpoint API

Pastikan untuk memperbarui IP Address sesuai dengan jaringan lokal Anda.

## 📝 Catatan Penting

1. IP Address: Pastikan IP Address di config.ts sesuai dengan IP lokal komputer Anda
2. Port: Pastikan port yang digunakan tidak bentrok dengan aplikasi lain
3. Network: Pastikan semua perangkat berada dalam jaringan yang sama

## 🛠 Troubleshooting

### Masalah Umum:
- Connection Error: Periksa kembali IP Address di config.ts
- Port Already in Use: Ubah port di konfigurasi atau hentikan aplikasi yang menggunakan port tersebut
- Dependencies Error: Jalankan npm install kembali

## 🤝 Kontribusi

## 📄 Lisensi

Distributed under the MIT License. See LICENSE for more information.

---

Dibuat dengan ❤️ untuk lingkungan yang lebih baik