export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  image: string;
  type?: string; // Opsional jika Anda menggunakan kategori
  category?: string;
  points: number;
  quantity: number; // Properti ini wajib
}
