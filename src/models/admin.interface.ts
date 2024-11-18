export interface Event {
  is_active?: boolean;
  event_name: string;
  event_image: Buffer;
  event_description: string;
  event_price: number;
  event_location: string;
  event_capacity: number;
  categoryId: number;
  event_start_date: Date;
  event_end_date: Date;
  discounted_price?: number;
  is_online: boolean;
  is_paid: boolean;
  discount_id?: number;
}

export interface Discount {
  eventId?: number; // ID acara yang terkait
  discount_percentage: number; // Persentase diskon
  is_active: boolean; // Status aktif diskon
  end_date?: Date; // Tanggal berakhir diskon
}

export interface Category {
  category_name: string; // Nama kategori
  category_description: string; // Deskripsi kategori
}

export interface CreateEvent {
  event_name: string; // Nama acara
  event_image: string; // URL gambar acara
  event_description: string; // Deskripsi acara
  event_price: number; // Harga acara
  event_location: string; // Lokasi acara
  event_capacity: number; // Kapasitas acara
  categoryId: number; // ID kategori
  category_name: string;
  event_start_date: string; // Tanggal dan waktu mulai acara
  event_end_date: string; // Tanggal dan waktu selesai acara
  discounted_price?: number; // Harga diskon (opsional)
  is_online: string; // Apakah acara ini online
  is_paid: string; // Apakah acara ini bayar atau gratis
  discount_percentage: number; // Persentase diskon
  is_active: string; // Status aktif diskon
  discountId?: number;
}

export interface EventResponse {
  event_id: number;
  event_name: string; // Nama acara
  event_image: string; // URL gambar acara
  event_description: string; // Deskripsi acara
  event_price: number; // Harga acara
  event_location: string; // Lokasi acara
  event_capacity: number; // Kapasitas acara
  categoryId: number; // ID kategori
  category_name: string;
  event_start_date: Date | string; // Tanggal dan waktu mulai acara
  event_end_date: Date | string; // Tanggal dan waktu selesai acara
  discounted_price?: number; // Harga diskon (opsional)
  is_online: boolean; // Apakah acara ini online
  is_paid: boolean; // Apakah acara ini bayar atau gratis
  event_status?: "Ongoing" | "Completed";
}

export interface user {
  user_id: number;
  name: string;
  email: string;
  points: number;
}

export interface AuthProps {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface TokenPayloadProps {
  user_id: number;
  email: string;
  role: string;
}
