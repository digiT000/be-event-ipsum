import { PrismaClient } from "@prisma/client";
import { user } from "../../models/admin.interface";

// Mendefinisikan kelas 'listUser' yang akan menangani operasi terkait pengguna
export class listUser {
  // Mendeklarasikan properti 'prisma' untuk instance PrismaClient
  private prisma: PrismaClient;

  // Konstruktor untuk inisialisasi instance PrismaClient
  constructor() {
    // Menginisialisasi properti prisma dengan instance baru PrismaClient
    this.prisma = new PrismaClient();
  }

  // Metode untuk mengambil semua data pengguna dari database
  async getAllUsers() {
    // Menggunakan Prisma untuk mengambil semua data pengguna (users) dari database
    // 'findMany' akan mengambil seluruh data pengguna dan 'include' digunakan untuk menyertakan data terkait (user_referral)
    const users = await this.prisma.users.findMany({
      include: {
        user_referral: true, // Menyertakan data terkait user_referral jika ada
      },
    });

    // Mengembalikan hasil query dalam bentuk array user, dengan casting tipe ke 'user[]'
    return users as user[]; // Mengkonversi tipe data yang didapat menjadi array dari tipe 'user'
  }
}
