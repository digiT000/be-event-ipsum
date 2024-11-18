import { PrismaClient } from "@prisma/client";
import { Event, EventResponse } from "../../models/admin.interface";
import { env } from "process";
import cloudinary from "../../config/cloudinary";
import { Discount } from "../../models/admin.interface";
import { unlink } from "fs/promises";

export class AdminService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllEvents() {
    const currentDate = new Date();
    // Mengambil semua event dari database menggunakan Prisma
    // Metode untuk mengambil semua acara dari database.
    const response = await this.prisma.event.findMany({
      include: {
        Category: true,
      },
    });

    // Remap the response
    const listEvent: EventResponse[] = response.map((event) => {
      const date = event.event_end_date;
      return {
        event_id: event.event_id,
        event_name: event.event_name,
        categoryId: event.Category.category_id,
        category_name: event.Category.category_name,
        event_image: event.event_image,
        event_description: event.event_description,
        event_price: event.event_price,
        event_location: event.event_location,
        event_capacity: event.event_capacity,
        event_start_date: new Date(event.event_start_date).toLocaleDateString(),
        event_end_date: new Date(event.event_end_date).toLocaleDateString(),
        discounted_price: event.discounted_price,
        is_online: event.is_online,
        is_paid: event.is_paid,
        event_status: currentDate > date ? "Completed" : "Ongoing",
      };
    });

    return listEvent;
  }

  async getEventById(event_id: number) {
    // Mengambil event tunggal berdasarkan ID yang diberikan
    return this.prisma.event.findUnique({
      where: { event_id },
      include: { Discount: true },
    });
  }

  async createEvent(eventData: Event, discountData: Discount) {
    // Menghitung harga setelah diskon
    const originalPrice = eventData.event_price as number; // Mengambil harga asli
    const discountedPrice =
      originalPrice * (1 - discountData.discount_percentage / 100); // Menghitung harga diskon

    // upload gambar ke cloudinary
    const upload = await cloudinary.uploader.upload(eventData.event_image, {
      folder: "events",
    });

    // Membuat event baru di database

    // Membuat acara baru dalam database

    const discountResponse = await this.prisma.dicount_Event.create({
      data: {
        discount_percentage: Number(discountData.discount_percentage),
        is_active: discountData.is_active,
        end_date: new Date(eventData.event_end_date),
      },
    });

    if (discountResponse) {
      const newEvent = await this.prisma.event.create({
        data: {
          event_name: eventData.event_name,
          event_image: upload.secure_url,
          event_description: eventData.event_description,
          discountId: discountResponse.discount_id,
          discounted_price: discountedPrice,
          event_price: Number(eventData.event_price),
          event_location: eventData.event_location,
          event_capacity: Number(eventData.event_capacity),
          categoryId: Number(eventData.categoryId),
          event_start_date: new Date(eventData.event_start_date),
          event_end_date: new Date(eventData.event_end_date),
          is_online: eventData.is_online,
          is_paid: eventData.is_paid,
        },
      });

      return newEvent;
    } else {
      return {
        status: 400,
        message: "Failed to create discount event",
      };
    }
  }

  async updateEvent(
    event_id: number,
    discount_id: number,
    updatedEventData: Event,
    discountPercentage: number,
    is_active: boolean
  ) {
    // Menghitung harga setelah diskon untuk event yang diperbarui
    const originalPrice = updatedEventData?.event_price as number; // Mengambil harga asli
    const discountedPrice = originalPrice * (1 - discountPercentage / 100); // Menghitung harga diskon
    let image: string | undefined = undefined;
    if (updatedEventData.event_image) {
      // upload gambar ke cloudinary
      const upload = await cloudinary.uploader.upload(
        updatedEventData.event_image,
        {
          folder: "events",
        }
      );
      image = upload.secure_url;

      // Memperbarui event berdasarkan ID
    }

    // Memperbarui acara berdasarkan ID

    const updatedEvent = await this.prisma.event.update({
      where: { event_id: event_id }, // Mencari event berdasarkan ID
      data: {
        event_name: updatedEventData.event_name,
        event_image: image,
        event_description: updatedEventData.event_description,
        discounted_price: discountedPrice, // Menyimpan harga diskon baru
        event_price: Number(updatedEventData.event_price),
        event_location: updatedEventData.event_location,
        event_capacity: Number(updatedEventData.event_capacity),
        categoryId: Number(updatedEventData.categoryId),
        event_start_date: new Date(updatedEventData.event_start_date), // Mengonversi ke tipe Date
        event_end_date: new Date(updatedEventData.event_end_date), // Mengonversi ke tipe Date
        is_online: updatedEventData.is_online,
        is_paid: updatedEventData.is_paid,
      },
    });

    // Memperbarui diskon terkait dengan event
    const newDiscount = await this.prisma.dicount_Event.update({
      where: { discount_id: discount_id }, // Mencari diskon berdasarkan ID
      data: {
        discount_percentage: discountPercentage, // Menyimpan persentase diskon baru
        is_active: is_active, // Status aktif dari diskon
        end_date: new Date(updatedEventData.event_end_date), // Tanggal berakhir diskon sesuai acara
      },
    });

    // Mengembalikan objek yang berisi event dan diskon yang diperbarui
    return { updatedEvent, newDiscount };
  }

  async deleteEvent(event_id: number) {
    const dataEvent = await this.prisma.event.findUnique({
      where: {
        event_id: event_id,
      },
    });

    // Hapus transaksi terkait terlebih dahulu
    await this.prisma.transaction.deleteMany({
      where: {
        eventId: event_id, // Ganti dengan ID event yang ingin dihapus
      },
    });

    if (dataEvent) {
      // Hapus event
      const deleteEvent = await this.prisma.event.delete({
        where: { event_id: event_id },
      });
      // Hapus semua entri terkait di Discount_Event
      await this.prisma.dicount_Event.delete({
        where: { discount_id: dataEvent?.discountId },
      });

      return deleteEvent;
    }
  }
  async getEventBySearch(searchString: string): Promise<EventResponse[]> {
    const response = await this.prisma.event.findMany({
      include: {
        Category: true,
      },
      where: {
        event_name: {
          contains: searchString,
          mode: "insensitive",
        },
      },
    });

    if (response) {
      const listEvent: EventResponse[] = response.map((event) => {
        return {
          event_id: event.event_id,
          event_name: event.event_name,
          categoryId: event.Category.category_id,
          category_name: event.Category.category_name,
          event_image: event.event_image,
          event_description: event.event_description,
          event_price: event.event_price,
          event_location: event.event_location,
          event_capacity: event.event_capacity,
          event_start_date: new Date(
            event.event_start_date
          ).toLocaleDateString(),
          event_end_date: new Date(event.event_end_date).toLocaleDateString(),
          discounted_price: event.discounted_price,
          is_online: event.is_online,
          is_paid: event.is_paid,
        };
      });

      return listEvent;
    } else {
      return [];
    }
  }
}
