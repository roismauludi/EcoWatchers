require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const { initializeApp } = require('firebase/app'); // Import modular Firebase
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth'); // Import metode auth
const { getFirestore, doc, setDoc, collection, getDocs, query, where, addDoc, deleteDoc, updateDoc, increment, getDoc, orderBy, limit } = require('firebase/firestore');
const { arrayUnion } = require('firebase/firestore');
const multer = require("multer"); // Untuk menangani unggahan file
const moment = require('moment-timezone');
const path = require("path");
const fs = require("fs");


// Middleware
const app = express();
const PORT = process.env.PORT || 5000;

// Gunakan environment variable untuk konfigurasi Firebase (isi di Render dashboard)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "uploads", "photos");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });
// Inisialisasi Firebase
const appFirebase = initializeApp(firebaseConfig);

// Inisialisasi Firebase Authentication dan Firestore
const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // Pastikan body-parser digunakan untuk parsing JSON
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/photos', express.static(path.join(__dirname, 'uploads', 'photos')));
// Endpoint untuk root
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Endpoint untuk mendaftar pengguna
app.post('/api/register', [
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('nama').notEmpty().withMessage('Nama is required'),
    body('jenisBank').notEmpty().withMessage('Jenis Bank is required'),
    body('namaRekening').notEmpty().withMessage('Nama Rekening is required'),
    body('noRekening').notEmpty().withMessage('No Rekening is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, nama, jenisBank, namaRekening, noRekening } = req.body;

    try {
        // Periksa apakah email sudah digunakan
        const existingUser = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
        if (!existingUser.empty) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Buat pengguna di Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Simpan data pengguna di Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email,
            nama,
            jenisBank,
            namaRekening,
            noRekening,
            level: 'penyumbang',
            status: 'Non-Aktif',
            point: 0,
            totalpointmasuk: 0,
            totalpointkeluar: 0,
            foto: 'default.jpg',
        });

        // Respons sukses
        return res.status(201).json({ message: 'User registered successfully', userId: userCredential.user.uid });
    } catch (error) {
        console.error('Error registering user:', error.message);
        return res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
    }
});


// Get catalog data
app.get('/api/catalog', async (req, res) => {
    console.log('Received GET request at /api/catalog');

    try {
        // OPTIMIZED: tambahkan limit 100
        const catalogRef = query(collection(db, 'katalog'), limit(100));
        const snapshot = await getDocs(catalogRef);

        console.log('Catalog snapshot size:', snapshot.size);

        const data = snapshot.docs.flatMap((doc) => {
            const docData = doc.data();
            console.log(`Processing document: ${doc.id}`);

            const flattenedData = [];
            Object.keys(docData).forEach((category) => {
                console.log(`Processing category: ${category}`);

                if (Array.isArray(docData[category])) {
                    docData[category].forEach((item) => {
                        console.log(`Processing item: ${item.Nama_barang}`);
                        flattenedData.push({
                            id: item.Id_barang || "",
                            name: item.Nama_barang || "",
                            category,
                            points: item.Point || 0,
                            unit: category === "Elektronik" ? "unit" : "kg",
                            image: item.Image || "default",
                            description: item.Deskripsi || "No description available",
                        });
                    });
                }
            });

            return flattenedData;
        });

        console.log('Final catalog data:', JSON.stringify(data, null, 2));
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching catalog data:', error);
        res.status(500).send('Error fetching catalog data');
    }
});

// Endpoint untuk menambahkan barang ke dalam tong
app.post("/api/add-to-tong", async (req, res) => {
    console.log("Received data:", req.body);

    const { userId, itemId, name, description, image, points, type, quantity = 1 } = req.body;

    // Validate required fields
    if (!name || !description || !image || points === undefined || !type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (quantity <= 0 || typeof quantity !== 'number') {
        return res.status(400).json({ error: "Invalid quantity. It must be a positive number." });
    }

    const timestamp = new Date().toISOString();

    try {
        const docRef = await addDoc(collection(db, "tong"), {
            userId,
            itemId,
            name,
            description,
            image,
            points,
            type,
            quantity,
            timestamp,
        });

        console.log("Item added to tong:", {
            userId,
            itemId,
            name,
            description,
            image,
            points,
            type,
            quantity,
            timestamp,
        });

        res.status(200).json({ message: "Item added successfully" });
    } catch (error) {
        console.error("Error adding item to tong:", error.message, error.stack);
        res.status(500).json({ message: "Error adding item to tong" });
    }
});


  // Endpoint GET untuk mengambil data dari koleksi "tong" berdasarkan userId
  app.get('/api/get-items/:userId', async (req, res) => {
    const { userId } = req.params; // Mengambil userId dari parameter URL
  
    try {
        // Query Firestore untuk mengambil data berdasarkan userId
        const snapshot = await getDocs(query(collection(db, 'tong'), where('userId', '==', userId)));
  
        // Mengecek apakah data ada
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No items found' });
        }
  
        // Menyusun data menjadi array dari dokumen Firestore
        const items = snapshot.docs.map(doc => doc.data());
        res.json(items); // Mengirimkan data item ke frontend
  
    } catch (error) {
        console.error('Error retrieving tong items:', error);
        res.status(500).json({ message: 'Error retrieving tong items' });
    }
});

app.delete('/api/delete-item/:itemId', async (req, res) => {
    const { itemId } = req.params;

    try {
        const querySnapshot = await getDocs(query(
            collection(db, 'tong'),
            where('itemId', '==', itemId)
        ));

        if (querySnapshot.empty) {
            return res.status(200).json({ message: 'No items remaining', items: [] });
        }

        for (const docSnapshot of querySnapshot.docs) {
            const docRef = doc(db, 'tong', docSnapshot.id);
            await deleteDoc(docRef);
        }

        // OPTIMIZED: Ambil item hanya milik user tertentu jika memungkinkan (misal: userId dikirim di req.query)
        let remainingItems = [];
        if (req.query.userId) {
            const q = query(collection(db, 'tong'), where('userId', '==', req.query.userId));
            const remainingItemsSnapshot = await getDocs(q);
            remainingItems = remainingItemsSnapshot.docs.map(doc => doc.data());
        } else {
            // fallback: ambil max 20 item
            const q = query(collection(db, 'tong'), limit(20));
            const remainingItemsSnapshot = await getDocs(q);
            remainingItems = remainingItemsSnapshot.docs.map(doc => doc.data());
        }
        res.status(200).json({ message: 'Item deleted successfully', items: remainingItems });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Error deleting item', error: error.message });
    }
});



// Endpoint untuk menambah alamat
app.post('/api/add-address', async (req, res) => {
    const { userId, nama, noTlp, labelAlamat, kotaKabupaten, kecamatan, kodePos, detailAlamat, blokNo, rtRw } = req.body;

    console.log('Received POST request at /api/add-address');
    console.log('Request body:', req.body);
    console.log('Received userId:', userId);

    try {
        // Pastikan data alamat sesuai dengan struktur yang diinginkan
        const addressData = {
            Nama: nama,
            No_tlp: noTlp,
            label_Alamat: labelAlamat,
            "kota-kabupaten": kotaKabupaten,
            Kecamatan: kecamatan,
            Kode_pos: kodePos,
            Detail_Alamat: detailAlamat,
            Blok_No: blokNo,
            rtRw: rtRw,
            userId,
        };

        // Menambahkan alamat baru ke Firestore
        const addressRef = await addDoc(collection(db, "Alamat"), addressData);

        console.log('Address added with ID:', addressRef.id);

        // Respons berhasil
        return res.status(201).send('Address added successfully');
    } catch (error) {
        console.error('Error adding address:', error);
        return res.status(500).send('Error adding address');
    }
});

// Endpoint untuk mengambil alamat pengguna berdasarkan userId
app.get('/api/get-addresses/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('Received GET request for userId:', userId);
    try {
        // OPTIMIZED: gunakan query where userId
        const q = query(collection(db, "Alamat"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const addresses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return res.status(500).send('Error fetching addresses');
    }
});

// Endpoint untuk edit alamat
app.put('/api/edit-address/:id', async (req, res) => {
    const { id } = req.params;
    const {
        nama,
        noTlp,
        labelAlamat,
        kotaKabupaten,
        kecamatan,
        kodePos,
        detailAlamat,
        blokNo,
        rtRw
    } = req.body;

    try {
        const addressRef = doc(db, 'Alamat', id);
        // Update data alamat sesuai struktur
        await updateDoc(addressRef, {
            Nama: nama,
            No_tlp: noTlp,
            label_Alamat: labelAlamat,
            "kota-kabupaten": kotaKabupaten,
            Kecamatan: kecamatan,
            Kode_pos: kodePos,
            Detail_Alamat: detailAlamat,
            Blok_No: blokNo,
            rtRw: rtRw
        });
        return res.status(200).json({ message: 'Alamat berhasil diupdate' });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({ message: 'Gagal mengupdate alamat' });
    }
});

// Mapping biaya penjemputan daur ulang per kecamatan
const kecamatanBiayaDaurUlang = {
  "Batam Kota": 15000,
  "Lubuk Baja": 22500,
  "Batu Ampar": 25000,
  "Bengkong": 27500,
  "Sei Beduk": 30000,
  "Nongsa": 35000,
  "Sekupang": 40000,
  "Batu Aji": 45000,
  "Sagulung": 50000,
  "Belakang Padang": 80000,
  "Bulang": 90000,
  "Galang": 115000,
};
async function getPickupFeeDaurUlang(kecamatan) {
  const feeDocRef = doc(db, 'settings', 'pickupFeeKecamatan');
  const feeDoc = await getDoc(feeDocRef);
  let mapping = {};
  if (feeDoc.exists() && typeof feeDoc.data().mapping === 'object') {
    mapping = feeDoc.data().mapping;
  }
  // Normalisasi key kecamatan
  const kecamatanUser = (kecamatan || '').trim().toLowerCase();
  const mappingKeys = Object.keys(mapping);
  const foundKey = mappingKeys.find(
    k => k.trim().toLowerCase() === kecamatanUser
  );
  return foundKey ? mapping[foundKey] : 20000;
}

app.post('/api/submit-pickup', upload.array('photos'), async (req, res) => {
    try {
        // Menyimpan data dari form
        const { userId, address, items, pickUpDate } = req.body;

        // Parsing JSON yang diterima sebagai string
        const parsedAddress = JSON.parse(address); // Mengubah string menjadi objek
        const parsedItems = JSON.parse(items); // Mengubah string menjadi objek

        // Validasi jika data wajib tidak ada
        if (!userId || !parsedAddress || !parsedItems || !pickUpDate || !req.files.length) {
            return res.status(400).json({ message: "Semua data wajib diisi." });
        }

        console.log('Tanggal yang diterima:', pickUpDate);
        const formattedPickUpDate = moment(pickUpDate, 'dddd, DD MMMM YYYY', 'id', true);
        console.log('Tanggal setelah format:', formattedPickUpDate.format());

        if (!formattedPickUpDate.isValid()) {
            return res.status(400).json({ message: 'Tanggal pickup tidak valid. Format yang benar adalah Hari-Bulan-Tahun (Contoh: Kamis, 13 Desember 2024).' });
        }

        // Konversi ke ISO format jika valid
        const isoFormattedPickUpDate = formattedPickUpDate.toISOString();

        // Menyusun URL untuk foto yang diupload
        const photoUrls = req.files.map(file => {
            return path.join('uploads/photos', file.filename); // Atau Anda dapat menyimpan URL yang dapat diakses secara publik
        });

        // Perbaiki ambil antrian terakhir (queue number) agar tidak boros read
        const q = query(collection(db, "Penyetoran"), orderBy("queueNumber", "desc"), limit(1));
        const snapshot = await getDocs(q);
        let lastQueueNumber = 0;
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (data.queueNumber) {
            lastQueueNumber = parseInt(data.queueNumber.split('-')[1], 10);
          }
        }

        // Generate nomor antrean baru
        const newQueueNumber = `ANTRIAN-${String(lastQueueNumber + 1).padStart(3, '0')}`;

        // Hitung biaya penjemputan berdasarkan kecamatan
        const kecamatan = parsedAddress.Kecamatan;
        const pickUpFee = await getPickupFeeDaurUlang(kecamatan);

        // Simpan data pickup ke Firestore
        const pickupData = {
            userId,
            queueNumber: newQueueNumber, // Nomor antrean baru
            address: parsedAddress, // Pastikan alamat sudah berupa objek
            items: parsedItems,
            photos: photoUrls, // Simpan array path file
            pickUpDate: isoFormattedPickUpDate, // Gunakan formattedPickUpDate dalam ISO
            pickUpFee: pickUpFee, // Gunakan biaya hasil fungsi
            status: "Pending",
            createdAt: new Date().toISOString(),
        };

        // Simpan `pickupData` ke Firestore
        await addDoc(collection(db, "Penyetoran"), pickupData);

        // Kirim respon sukses
        res.status(200).json({ message: "Data berhasil diterima", queueNumber: newQueueNumber, photos: req.files });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

app.get('/api/get-pickups/:userId', async (req, res) => {
    const { userId } = req.params;  // Mengambil userId dari URL parameter
    console.log('Received GET request for userId:', userId);

    try {
        // Ambil parameter query (opsional), jika ada filter tambahan
        const { queueNumber, status } = req.query;

        // Query ke Firestore untuk koleksi Penyetan berdasarkan userId
        const collectionRef = collection(db, "Penyetoran");
        let querySnapshot;

        // Buat query berdasarkan userId yang ada di URL
        let queryConstraints = [where('userId', '==', userId)];  // Filter berdasarkan userId
        if (queueNumber) queryConstraints.push(where('queueNumber', '==', queueNumber));
        if (status) queryConstraints.push(where('status', '==', status));

        // Lakukan query dengan constraint yang sudah dibuat
        const filteredQuery = query(collectionRef, ...queryConstraints);
        querySnapshot = await getDocs(filteredQuery);

        // Jika tidak ada data
        if (querySnapshot.empty) {
            return res.status(404).json({ message: "Tidak ada data yang ditemukan." });
        }

        // Format hasil query menjadi array
        const pickups = [];
        querySnapshot.forEach(doc => {
            pickups.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Kirim respon sukses
        res.status(200).json({ message: "Data berhasil diambil", data: pickups });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

app.get('/api/get-pickups', async (req, res) => {
    try {
        // Mengambil query parameter 'queueNumber' dari URL
        const { queueNumber } = req.query;

        console.log('Received GET request with query parameter queueNumber:', queueNumber);

        // Query ke Firestore untuk koleksi Penyetan
        const collectionRef = collection(db, "Penyetoran");
        let querySnapshot;

        // Pastikan 'queueNumber' diterima sebagai parameter
        if (!queueNumber) {
            return res.status(400).json({ message: "Parameter 'queueNumber' wajib disertakan." });
        }

        // Lakukan query berdasarkan queueNumber
        const filteredQuery = query(collectionRef, where('queueNumber', '==', queueNumber));
        querySnapshot = await getDocs(filteredQuery);

        // Jika tidak ada data yang ditemukan
        if (querySnapshot.empty) {
            return res.status(404).json({ message: "Tidak ada data yang ditemukan dengan queueNumber tersebut." });
        }

        // Format hasil query menjadi array
        const pickups = [];
        querySnapshot.forEach(doc => {
            pickups.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Kirim respon sukses dengan data
        res.status(200).json({ message: "Data berhasil diambil", data: pickups });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
});

app.put('/api/update-status/:pickupId', async (req, res) => {
    const { pickupId } = req.params;
    
    try {
        // Reference to the document in Firestore
        const pickupRef = doc(db, 'Penyetoran', pickupId);  // Correct Firestore method for referencing document
        
        // Update the status of the pickup
        await updateDoc(pickupRef, {
            status: 'Dibatalkan'
        });

        res.status(200).json({ message: 'Status berhasil diubah menjadi Dibatalkan' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui status' });
    }
});

app.put('/api/updatestatus/:pickupId', async (req, res) => {
    const { pickupId } = req.params;
    const { newStatus } = req.body;  // Status baru yang diterima dari body request

    console.log('pickupId yang diterima:', pickupId); // Tambahkan log ini

    if (!newStatus) {
        return res.status(400).json({ message: 'Status baru harus diberikan' });
    }

    try {
        // Mengambil referensi dokumen dari koleksi 'Penyetoran'
        const pickupRef = doc(db, 'Penyetoran', pickupId);
        
        // Ambil data dari dokumen 'Penyetoran'
        const docSnapshot = await getDoc(pickupRef);
        console.log('Snapshot dokumen:', docSnapshot.exists(), docSnapshot.data()); // Tambahkan log ini

        if (!docSnapshot.exists()) {
            return res.status(404).json({ message: 'Data pickup tidak ditemukan' });
        }

        const currentStatus = docSnapshot.data()?.status;

        const validStatuses = {
            Pending: ['Dijemput'],
            Dijemput: ['Ditimbang'],
            Ditimbang: ['Selesai'],
        };

        // Cek apakah transisi status valid
        if (!validStatuses[currentStatus]?.includes(newStatus)) {
            return res.status(400).json({
                message: `Transisi status tidak valid dari ${currentStatus} ke ${newStatus}`,
            });
        }

        // Update status di koleksi 'Penyetoran'
        await updateDoc(pickupRef, { status: newStatus });

        // Jika status berubah dari 'Pending' ke 'Dijemput', tambahkan data ke koleksi 'Track'
        if (currentStatus === 'Pending' && newStatus === 'Dijemput') {
            const trackData = {
                pickupId: pickupId,
                queueNumber: docSnapshot.data()?.queueNumber,  // Ambil nomor antrian
                newStatus: newStatus,
                statuses: [],
                timestamp: new Date(),  // Waktu perubahan status
            };

            // Menambahkan data ke koleksi 'Track'
            console.log('Menambahkan data ke koleksi Track:', trackData); // Tambahkan log ini
            const trackRef = collection(db, 'Track');
            await addDoc(trackRef, trackData);
        }

        res.status(200).json({ message: `Status berhasil diubah menjadi ${newStatus}` });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui status' });
    }
});

app.get('/api/track-pickup/:pickupId', async (req, res) => {
    const pickupId = req.params.pickupId;
    console.log(`Menerima permintaan untuk pickupId: ${pickupId}`);

    try {
        const db = getFirestore();
        const penyetoranRef = doc(db, "Penyetoran", pickupId);
        const penyetoranSnapshot = await getDoc(penyetoranRef);

        if (!penyetoranSnapshot.exists()) {
            console.log(`Dokumen Penyetoran dengan ID ${pickupId} tidak ditemukan.`);
            return res.status(404).json({ message: "pickupId dari penyetoran tidak ditemukan." });
        }

        const penyetoranData = penyetoranSnapshot.data();
        console.log("Data dari dokumen Penyetoran:", penyetoranData);

        const queueNumber = penyetoranData.queueNumber; // Pastikan ini diambil dengan benar
        console.log("Queue Number:", queueNumber);

        const trackRef = collection(db, "Track");
        const trackQuery = query(trackRef, where("queueNumber", "==", queueNumber));
        const trackSnapshot = await getDocs(trackQuery);

        if (trackSnapshot.empty) {
            console.log(`Dokumen Track dengan queueNumber ${queueNumber} tidak ditemukan.`);
            return res.status(404).json({ message: "Data penjemputan tidak ditemukan." });
        }

        const trackData = trackSnapshot.docs.map(doc => doc.data())[0];
        console.log("Data dari dokumen Track:", trackData);

        // Format statuses dan timestamp
        const formattedStatuses = trackData.statuses ? trackData.statuses.map(status => {
            return {
                status: status.status || "Tidak diketahui", // Pastikan status ada
                timestamp: status.timestamp ? new Date(status.timestamp.seconds * 1000 + status.timestamp.nanoseconds / 1000000) : null // Konversi timestamp jika ada
            };
        }) : [];

        // Pastikan `queueNumber` dikirimkan dalam respons
        res.json({
            queueNumber: queueNumber,  // Mengirimkan queueNumber
            newStatus: trackData.newStatus,  // Status terbaru
            statuses: formattedStatuses,  // Mengirimkan status dalam array yang terformat
            timestamp: trackData.timestamp ? new Date(trackData.timestamp.seconds * 1000 + trackData.timestamp.nanoseconds / 1000000) : null,  // Mengirimkan timestamp
        });
    } catch (error) {
        console.error("Error fetching tracking data:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat melacak data penjemputan." });
    }
});

app.put('/api/update-track-status', async (req, res) => {
    const { pickupId, newStatus } = req.body;

    // Validasi input
    if (!pickupId || !newStatus) {
        return res.status(400).json({
            success: false,
            message: 'pickupId dan newStatus diperlukan',
        });
    }

    try {
        // Mencari dokumen Track berdasarkan pickupId
        const trackRef = collection(db, 'Track');  // Mengakses koleksi 'Track'
        const snapshot = await getDocs(query(trackRef, where('pickupId', '==', pickupId)));

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: 'Dokumen tidak ditemukan',
            });
        }

        // Ambil dokumen pertama yang ditemukan
        const docRef = snapshot.docs[0].ref;

        // Membuat objek status baru dengan timestamp
        const statusWithTimestamp = {
            status: newStatus,
            timestamp: new Date(),  // Menyimpan waktu saat status diperbarui
        };

        // Memperbarui dokumen dengan menambahkan status baru ke array 'statuses'
        await updateDoc(docRef, {
            statuses: arrayUnion(statusWithTimestamp),  // Menambahkan status baru ke array
        });

        res.status(200).json({
            success: true,
            message: 'Status berhasil diperbarui',
        });
    } catch (error) {
        console.error('Error updating track status:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui status',
        });
    }
});

app.put("/api/update-quantity/:id", async (req, res) => {
    const { id } = req.params; // id diambil dari URL parameter
    const { pickupId, newQuantity } = req.body; // pickupId dan newQuantity diambil dari body request

    // Tambahkan log debug
    console.log('BACKEND DEBUG update-quantity:', {
      id,
      pickupId,
      newQuantity,
      typeofNewQuantity: typeof newQuantity,
      body: req.body
    });

    // Validasi input
    if (!pickupId || !id || newQuantity === undefined) {
      return res.status(400).json({
        message: "pickupId, id, dan newQuantity harus diberikan",
      });
    }

    try {
      const pickupRef = doc(db, "Penyetoran", pickupId); // Referensi ke dokumen Penyetoran
      const docSnapshot = await getDoc(pickupRef);

      // Cek apakah dokumen ada
      if (!docSnapshot.exists()) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      const data = docSnapshot.data();
      const updatedItems = data.items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      // Perbarui dokumen di koleksi Penyetoran
      await updateDoc(pickupRef, { items: updatedItems });

      return res.status(200).json({
        success: true,
        message: `Quantity berhasil diubah menjadi ${newQuantity}`,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      return res.status(500).json({
        message: "Terjadi kesalahan saat memperbarui quantity",
      });
    }
  });
  


app.post("/api/add-points", async (req, res) => {
    const { userId, points } = req.body;
    console.log("Received points:", points, "for user:", userId); // Log the received points
  
    if (!userId || points === undefined) {
      return res.status(400).json({ error: "Missing userId or points" });
    }
  
    try {
      const userDocRef = doc(db, "users", userId);
  
      // Update the user's totalpointmasuk and point
      await updateDoc(userDocRef, {
        totalpointmasuk: increment(points), // Add points to totalpointmasuk
        point: increment(points),           // Add points to point
      });
  
      res.status(200).json({ message: "Points added successfully" });
    } catch (error) {
      console.error("Error adding points to user:", error);
      res.status(500).json({ error: "Failed to add points to user" });
    }
  });
  
  app.get('/getUserData/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log("Requested userId:", userId); // Log untuk mengecek userId yang diterima

    try {
        // Ambil data dari koleksi 'penyetoran' berdasarkan userId dan status 'Selesai' atau 'Dibatalkan'
        const penyetoranQuery = query(
            collection(db, 'Penyetoran'),
            where('userId', '==', userId),
            where('status', 'in', ['Selesai', 'Dibatalkan']) // Menambahkan filter status
        );
        const penyetoranSnapshot = await getDocs(penyetoranQuery);

        // Format data penyetoran
        const penyetoranData = [];
        penyetoranSnapshot.forEach(doc => {
            penyetoranData.push({ id: doc.id, ...doc.data() });
        });

        // Ambil data dari koleksi 'transactions' berdasarkan userId
        const transactionsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', userId)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        // Format data transaksi
        const transactionsData = [];
        transactionsSnapshot.forEach(doc => {
            transactionsData.push({ id: doc.id, ...doc.data() });
        });

        // Jika hanya ada data penyetoran, tetap kirimkan data tersebut
        if (penyetoranData.length > 0 || transactionsData.length > 0) {
            res.status(200).json({
                userId,
                penyetoran: penyetoranData,
                transactions: transactionsData,
            });
        } else {
            res.status(404).json({ message: 'Tidak Ada Data Riwayat.' });
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});

// Endpoint untuk pembatalan penyetoran
app.post('/api/cancel-pickup/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, status } = req.body;

    // Validasi input
    if (!reason || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alasan pembatalan dan status harus diisi' 
      });
    }

    // Cari dokumen penyetoran berdasarkan ID
    const penyetoranRef = doc(db, 'Penyetoran', id);
    const penyetoranDoc = await getDoc(penyetoranRef);

    if (!penyetoranDoc.exists()) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data penyetoran tidak ditemukan' 
      });
    }

    // Update dokumen dengan menambahkan alasan pembatalan
    await updateDoc(penyetoranRef, {
      cancelReason: reason,
      status: status, // Tetap mempertahankan status yang dikirim
      updatedAt: new Date().toISOString()
    });

    // Tambahkan notifikasi ke koleksi Notifications
    const notificationRef = collection(db, 'Notifications');
    await addDoc(notificationRef, {
      userId: penyetoranDoc.data().userId,
      type: 'cancel',
      message: `Penyetoran Anda telah dibatalkan dengan alasan: ${reason}`,
      pickupId: id,
      createdAt: new Date().toISOString(),
      read: false
    });

    res.json({ 
      success: true, 
      message: 'Pembatalan berhasil disimpan' 
    });
  } catch (error) {
    console.error('Error canceling pickup:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat menyimpan pembatalan' 
    });
  }
});

// === CAMPAIGN API ===
// Ambil semua campaign
app.get('/api/campaigns', async (req, res) => {
  try {
    // OPTIMIZED: tampilkan campaign status ongoing dan ended, limit 100
    const campaignsRef = query(
      collection(db, 'campaigns'),
      where('status', 'in', ['ongoing', 'ended']),
      limit(100)
    );
    const snapshot = await getDocs(campaignsRef);
    const now = new Date();
    const campaigns = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      let campaignDate = null;
      let isEnded = false;
      try {
        const [day, month, year] = data.date.split(' ');
        const monthMap = {
          'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
          'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };
        campaignDate = new Date(Number(year), monthMap[month], Number(day));
        if (
          campaignDate.getFullYear() === now.getFullYear() &&
          campaignDate.getMonth() === now.getMonth() &&
          campaignDate.getDate() === now.getDate() &&
          data.time
        ) {
          // Format time: '09.00–10.30 WIB', '05:05-06:10', '05.05-06.10', dst
          let timeStr = data.time.replace('–', '-').replace('—', '-').replace('–', '-');
          let timeRange = timeStr.split('-');
          if (timeRange.length === 2) {
            let endTime = timeRange[1].replace('WIB', '').trim(); // '10.30' atau '06:10'
            // Deteksi pemisah jam
            let hour = 0, minute = 0;
            if (endTime.includes(':')) {
              [hour, minute] = endTime.split(':').map(Number);
            } else if (endTime.includes('.')) {
              [hour, minute] = endTime.split('.').map(Number);
            }
            const campaignEnd = new Date(now);
            campaignEnd.setHours(hour, minute, 0, 0);
            console.log('now:', now, 'campaignEnd:', campaignEnd, 'isEnded:', isEnded, 'title:', data.title);
            if (now > campaignEnd) {
              isEnded = true;
            }
          }
        } else if (campaignDate < now) {
          isEnded = true;
        }
      } catch (e) {
        if (campaignDate && campaignDate < now) isEnded = true;
      }
      if (data.status === 'ongoing' && isEnded) {
        await updateDoc(doc.ref, { status: 'ended' });
        data.status = 'ended';
      }
      return { id: doc.id, ...data };
    }));
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

// Tambah campaign baru
app.post('/api/campaigns', upload.single('image'), async (req, res) => {
  try {
    const { title, date, location, organizer, status = 'ongoing', time, registerLink, description, latitude, longitude } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/photos/${req.file.filename}`;
    }
    if (!title || !date || !location || !organizer) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    // Pastikan latitude dan longitude bertipe number jika ada
    let lat = latitude !== undefined && latitude !== '' ? Number(latitude) : null;
    let lng = longitude !== undefined && longitude !== '' ? Number(longitude) : null;
    const newCampaign = {
      title,
      date,
      time: time || '',
      location,
      organizer,
      registerLink: registerLink || '',
      description: description || '',
      status,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      // Tambahkan latitude dan longitude jika ada
      ...(lat !== null && !isNaN(lat) ? { latitude: lat } : {}),
      ...(lng !== null && !isNaN(lng) ? { longitude: lng } : {}),
    };
    const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
    res.status(201).json({ id: docRef.id, ...newCampaign });
  } catch (error) {
    console.error('Error adding campaign:', error);
    res.status(500).json({ message: 'Error adding campaign' });
  }
});

// Scheduled job untuk update status campaign setiap 1 menit
setInterval(async () => {
  try {
    // OPTIMIZED: filter status ongoing dan limit 100
    const campaignsRef = query(collection(db, 'campaigns'), where('status', '==', 'ongoing'), limit(100));
    const snapshot = await getDocs(campaignsRef);
    const now = moment().tz('Asia/Jakarta');
    const monthMap = {
      'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
      'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
    };
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      let campaignDate = null;
      let isEnded = false;
      try {
        // Parsing tanggal
        const [day, month, year] = data.date.split(' ');
        campaignDate = moment.tz(`${year}-${monthMap[month]+1}-${day}`, 'YYYY-M-D', 'Asia/Jakarta');
        // Parsing jam selesai
        if (campaignDate.isValid() && campaignDate.isSame(now, 'day') && data.time) {
          let timeStr = data.time.replace(/[–—]/g, '-').replace(/WIB|WITA|WIT/gi, '').trim();
          let timeRange = timeStr.split('-');
          if (timeRange.length === 2) {
            let endTime = timeRange[1].trim();
            let hour = 0, minute = 0;
            if (endTime.includes(':')) {
              [hour, minute] = endTime.split(':').map(Number);
            } else if (endTime.includes('.')) {
              [hour, minute] = endTime.split('.').map(Number);
            }
            const campaignEnd = campaignDate.clone().hour(hour).minute(minute).second(0);
            console.log(`[Campaign Scheduler] now: ${now.format()} | campaignEnd: ${campaignEnd.format()} | title: ${data.title}`);
            if (now.isAfter(campaignEnd)) {
              isEnded = true;
            }
          }
        } else if (campaignDate.isValid() && campaignDate.isBefore(now, 'day')) {
          isEnded = true;
        }
      } catch (e) {
        console.error('[Campaign Scheduler] Error parsing date/time:', e, data);
        if (campaignDate && campaignDate.isBefore(now, 'day')) isEnded = true;
      }
      if (data.status === 'ongoing' && isEnded) {
        await updateDoc(docSnap.ref, { status: 'ended' });
        console.log(`[Campaign Scheduler] Status campaign '${data.title}' diubah menjadi 'ended'`);
      }
    }
  } catch (e) {
    console.error('[Campaign Scheduler] Scheduled campaign status update error:', e);
  }
}, 60000);

// Mulai server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Endpoint untuk mengambil biaya penjemputan
app.get('/api/pickup-fee', async (req, res) => {
  try {
    const feeDocRef = doc(db, 'settings', 'pickupFee');
    const feeDoc = await getDoc(feeDocRef);
    let fee = 500;
    if (feeDoc.exists() && typeof feeDoc.data().fee === 'number') {
      fee = feeDoc.data().fee;
    }
    res.json({ fee });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil biaya penjemputan' });
  }
});

// Endpoint untuk mengubah biaya penjemputan
app.put('/api/pickup-fee', async (req, res) => {
  try {
    const { fee } = req.body;
    if (typeof fee !== 'number' || fee < 0) {
      return res.status(400).json({ message: 'Fee tidak valid' });
    }
    const feeDocRef = doc(db, 'settings', 'pickupFee');
    await setDoc(feeDocRef, { fee });
    res.json({ message: 'Biaya penjemputan berhasil diubah', fee });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah biaya penjemputan' });
  }
});

// === PICKUP FEE PER KECAMATAN ===
// Endpoint GET: ambil mapping biaya per kecamatan
app.get('/api/pickup-fee-kecamatan', async (req, res) => {
  try {
    const feeDocRef = doc(db, 'settings', 'pickupFeeKecamatan');
    const feeDoc = await getDoc(feeDocRef);
    let mapping = {};
    if (feeDoc.exists() && typeof feeDoc.data().mapping === 'object') {
      mapping = feeDoc.data().mapping;
    }
    res.json({ mapping });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil biaya penjemputan per kecamatan' });
  }
});
// Endpoint PUT: update mapping biaya per kecamatan
app.put('/api/pickup-fee-kecamatan', async (req, res) => {
  try {
    const { mapping } = req.body;
    if (!mapping || typeof mapping !== 'object') {
      return res.status(400).json({ message: 'Mapping tidak valid' });
    }
    const feeDocRef = doc(db, 'settings', 'pickupFeeKecamatan');
    await setDoc(feeDocRef, { mapping });
    res.json({ message: 'Biaya penjemputan per kecamatan berhasil diubah', mapping });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah biaya penjemputan per kecamatan' });
  }
});

app.put('/api/mark-points-added/:pickupId', async (req, res) => {
  const { pickupId } = req.params;
  try {
    const pickupRef = doc(db, 'Penyetoran', pickupId);
    await updateDoc(pickupRef, { pointsAdded: true });
    res.status(200).json({ message: 'pointsAdded updated' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update pointsAdded' });
  }
});
