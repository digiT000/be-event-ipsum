import { Request, Response, NextFunction } from "express";
import { AuthProps } from "../../models/user.interface";
import jwt from "jsonwebtoken";
import environment from "dotenv";
import { TokenPayloadProps } from "../../models/user.interface";

// Mengonfigurasi dotenv untuk memuat variabel lingkungan dari file .env
environment.config();

// Mendapatkan kunci rahasia (secret key) dari variabel lingkungan
const SECRET_KEY = process.env.SECRET_KEY as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

// Kelas middleware untuk otentikasi dan otorisasi pengguna
export class AuthMiddleware {
  // Middleware untuk validasi input login
  async validateLogin() {
    // Middleware ini akan digunakan untuk memeriksa input login
    // (Namun fungsi ini belum diimplementasikan)
  }

  // Middleware untuk validasi input pendaftaran pengguna (register)
  async validateRegisterInput(req: Request, res: Response, next: NextFunction) {
    // Mendestrukturisasi data dari body permintaan
    const { email, name, password, role }: AuthProps = req.body;

    // Memeriksa apakah semua field yang dibutuhkan telah diisi
    if (!email || !name || !password || !role) {
      // Jika ada field yang kosong, mengirimkan respons error dengan status 400
      res.status(400).send({
        status: res.statusCode,
        code: "REQ",
        message: "All fields are required",
        field: {
          email: email || "",
          password: password || "",
          name: name || "",
          role: role || "",
        },
      });
    } else {
      // Jika semua field terisi, lanjutkan ke middleware berikutnya
      next();
    }
  }

  // Middleware untuk memvalidasi token (misalnya untuk akses ke API yang membutuhkan otentikasi)
  async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      // Mendapatkan token dari header Authorization
      const token = req.headers.authorization?.split(" ")[1] as string;

      // Jika token tidak ada, mengirimkan respons error dengan status 401
      if (!token) {
        res.status(401).send({
          status: res.statusCode,
          message: "Token is required",
        });
        return; // Menghentikan eksekusi lebih lanjut jika token tidak ada
      }

      // Memverifikasi token menggunakan secret key dan mendekode payload
      const decodeToken = jwt.verify(token, SECRET_KEY) as TokenPayloadProps;

      // Menyimpan data pengguna yang telah didekodekan pada objek request (req)
      (req as any).user = decodeToken;

      // Melanjutkan ke middleware berikutnya jika token valid
      next();
    } catch (error) {
      // Jika terjadi error saat memverifikasi token, mengirimkan respons error dengan status 401
      res.status(401).send({ message: "Invalid token", detail: error });
    }
  }

  // Middleware untuk mengotorisasi pengguna berdasarkan peran (role)
  authorizeRole(role: "admin" | "user"): any {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Mendapatkan token dari header Authorization
        const token = req.headers.authorization?.split(" ")[1] as string;

        // Memverifikasi dan mendekode token
        const decodeToken = jwt.verify(token, SECRET_KEY) as TokenPayloadProps;

        // Memeriksa apakah role dalam token cocok dengan role yang diberikan pada middleware
        if (decodeToken.user_role !== role) {
          // Jika peran tidak cocok, mengirimkan respons error dengan status 403 (Forbidden)
          res.status(403).send({
            status: res.statusCode,
            message: "Unauthorized access",
          });
        } else {
          // Jika peran cocok, melanjutkan ke middleware berikutnya
          next();
        }
      } catch (error) {
        // Jika terjadi error, mengirimkan respons error dengan status 401
        res.status(401).send({
          status: res.statusCode,
          detail: error,
          message: "Invalid Token",
        });
      }
    };
  }
}
