import { Request, Response } from "express";
import { listUser } from "../../services/admin.services/admin.list.user.service";

export class AdminListUser {
  private listUser: listUser;
  constructor() {
    this.listUser = new listUser();
  }

  // Mendefinisikan metode asinkron 'getAllUsers' yang menerima request (req) dan response (res) dari Express
  async getAllUsers(req: Request, res: Response) {
    // Memanggil metode 'getAllUsers' dari kelas listUser untuk mengambil semua data pengguna dari database
    const users = await this.listUser.getAllUsers();

    // Memeriksa apakah data pengguna (users) ditemukan
    if (users) {
      // Jika data pengguna ditemukan, kirimkan respons dengan status 200 (OK) dan data pengguna dalam body respons
      res.status(200).send(users);
    } else {
      // Jika tidak ada data pengguna, kirimkan respons dengan status 404 (Not Found) dan pesan error
      res.status(404).send({ message: "Users not found" });
    } // End of if-else block
  }
}
