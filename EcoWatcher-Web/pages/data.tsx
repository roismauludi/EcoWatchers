import { db } from "../utils/firebase/config";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import React from "react";
import { FC } from "react";

interface DataType {
  // sesuaikan dengan struktur data Anda
  id: string;
  title: string;
  description: string;
  // ... field lainnya
}

const DataPage: FC = () => {
  // Fungsi untuk mengambil data
  const getData = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, "nama_koleksi"));
      querySnapshot.forEach((doc) => {
        const data = doc.data() as DataType;
        console.log(doc.id, " => ", data);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <h1>Halaman Data</h1>
      <button onClick={getData}>Ambil Data</button>
    </div>
  );
};

export default DataPage;
