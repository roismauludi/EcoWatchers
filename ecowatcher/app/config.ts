import { db } from "../firebaseConfig";

// config.ts
const CONFIG = {
    API_URL: 'http:192.168.100.10:5000', // Ganti dengan IP Anda dan tambahkan :5000 di akhir
    FIRESTORE_DB: db,
  };
  
  export default CONFIG;