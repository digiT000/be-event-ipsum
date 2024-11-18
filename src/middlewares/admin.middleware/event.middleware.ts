import { Request, Response, NextFunction } from "express";
import { CreateEvent } from "../../models/admin.interface";

export class EventAdminMiddleware {
  async validateCreateEventInput(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      categoryId,
      discount_percentage,
      event_capacity,
      event_description,
      event_location,
      event_name,
      event_price,
      event_start_date,
      is_active,
      is_online,
      is_paid,
      event_end_date,
    }: CreateEvent = req.body;
    const image = req.file ? req.file.path || "" : "";

    if (
      !event_name ||
      !image ||
      !event_description ||
      !discount_percentage ||
      !event_price ||
      !event_location ||
      !event_capacity ||
      !categoryId ||
      !event_start_date ||
      !event_end_date ||
      !is_active ||
      !is_online ||
      !is_paid
    ) {
      res.status(400).send({
        data: req.body,
        image: image,
        req_image: req.file,
        message: " semua field harus di isi", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (new Date(event_start_date) > new Date(event_end_date)) {
      res.status(400).send({
        message: "Event start date cannot be after event end date", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (Number(event_price) < 0) {
      res.status(400).send({
        message: "Harga acara harus lebih besar dari 0", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (Number(event_capacity) <= 0) {
      res.status(400).send({
        message: "Kapasitas acara harus lebih besar dari 0", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (Number(discount_percentage) < 0) {
      res.status(400).send({
        message: "Persentase diskon harus lebih besar dari 0", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else {
      next();
    }

    // if (!event_name) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event name is required",
    //   });
    // } else if (!image) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event image is required",
    //   });
    // } else if (
    //   !event_capacity ||
    //   isNaN(event_capacity) ||
    //   event_capacity <= 0
    // ) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event capacity is required and must be a positive number",
    //   });
    // } else if (!categoryId || isNaN(categoryId) || categoryId <= 0) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Category ID is required and must be a positive number",
    //   });
    // } else if (!event_description) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event description is required",
    //   });
    // } else if (is_paid === "true") {
    //   if (event_price === undefined || event_price <= 0) {
    //     res.status(400).send({
    //       status: res.statusCode,
    //       message: "Event price is required when is_paid is true",
    //     });
    //   } else if (
    //     discount_percentage === undefined ||
    //     discount_percentage <= 0
    //   ) {
    //     res.status(400).send({
    //       status: res.statusCode,
    //       message: "Discount percentage is required when is_paid is true",
    //     });
    //   }
    // } else if (is_paid === "false") {
    //   if (
    //     event_price.toString() === undefined ||
    //     event_price.toString() === ""
    //   ) {
    //     res.status(400).send({
    //       status: res.statusCode,
    //       message: "Event price is must be seat to 0 cannot be empty",
    //     });
    //   }
    // } else if (!event_start_date) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event start date is required",
    //   });
    // } else if (!event_end_date) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event end date is required",
    //   });
    // } else if (new Date(event_start_date) > new Date(event_end_date)) {
    //   res.status(400).send({
    //     status: res.statusCode,
    //     message: "Event start date cannot be after event end date",
    //   });
    // } else if (is_online === "true") {
    //   if (is_online === undefined) {
    //     res.status(400).send({
    //       status: res.statusCode,
    //       message: "Status event online harus di pilih",
    //     });
    //   }
    // } else if (is_online === "false") {
    //   if (is_online === undefined) {
    //     res.status(400).send({
    //       status: res.statusCode,
    //       message: "Status event offline harus di pilih",
    //     });
    //   }
    //   if (!event_location) {
    //     res.status(400).send({
    //       status: res.statusCode,
    //       message: "Event location is required when status event offline",
    //     });
    //   }
    // } else {
    //   next();
    // }
  }

  async validateEventUpdateInput(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      categoryId,
      discount_percentage,
      event_capacity,
      event_description,
      event_location,
      event_name,
      event_price,
      event_start_date,
      is_active,
      is_online,
      is_paid,
      event_end_date,
    }: CreateEvent = req.body;

    if (
      !event_name ||
      !event_description ||
      !discount_percentage ||
      !event_price ||
      !event_location ||
      !event_capacity ||
      !categoryId ||
      !event_start_date ||
      !event_end_date ||
      !is_active ||
      !is_online ||
      !is_paid
    ) {
      res.status(400).send({
        data: req.body,
        message: " semua field harus di isi", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (new Date(event_start_date) > new Date(event_end_date)) {
      res.status(400).send({
        message: "Event start date cannot be after event end date", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (Number(event_price) < 0) {
      res.status(400).send({
        message: "Harga acara harus lebih besar dari 0", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (Number(event_capacity) <= 0) {
      res.status(400).send({
        message: "Kapasitas acara harus lebih besar dari 0", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else if (Number(discount_percentage) < 0) {
      res.status(400).send({
        message: "Persentase diskon harus lebih besar dari 0", // Pesan error
        status: res.statusCode, // Menyertakan status kode dari respon
        details: res.statusMessage, // Menyertakan pesan status
      });
    } else {
      next();
    }
  }
}
