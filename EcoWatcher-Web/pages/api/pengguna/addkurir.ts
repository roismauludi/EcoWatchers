import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../utils/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { auth } from "../../../utils/firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";

// Tipe untuk Response API
type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { nama, email, password } = req.body;

  if (!nama || !email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Semua field harus diisi" });
  }

  try {
    // Buat akun di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Tambahkan data kurir ke Firestore menggunakan UID sebagai ID dokumen
    const userData = {
      nama: nama,
      email: email,
      level: "kurir", // Set default role sebagai kurir
      createdAt: new Date().toISOString(),
    };

    // Gunakan setDoc dengan UID sebagai ID dokumen
    await setDoc(doc(db, "users", user.uid), userData);

    res.status(200).json({
      success: true,
      data: {
        id: user.uid,
        ...userData,
      },
    });
  } catch (error: any) {
    console.error("Error adding courier:", error);
    let errorMessage = "Terjadi kesalahan saat menambahkan kurir";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email sudah terdaftar";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Format email tidak valid";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password terlalu lemah";
    }

    res.status(500).json({ success: false, error: errorMessage });
  }
}
