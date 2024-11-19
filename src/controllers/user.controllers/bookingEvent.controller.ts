import { Request, Response } from "express";
import { BookingEventService } from "../../services/user.services/bookingEvent.service";
import {
  BookingData,
  BookingServiceCode,
  ReviewData,
} from "../../models/booking.interface";
import { AuthUtils } from "../../utils/auth.utils";

export class BookingEventController {
  private bookingEventService: BookingEventService;
  private authUtils: AuthUtils;

  constructor() {
    this.bookingEventService = new BookingEventService();
    this.authUtils = new AuthUtils();
  }

  async getUsersBooking(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);

    if (decodedToken) {
      try {
        const bookingData = await this.bookingEventService.getUserbookings(
          decodedToken.user_id
        );
        res.status(200).send({
          message: "User booking retrieved successfully",
          status: res.statusCode,
          data: bookingData,
        });
      } catch (error) {
        res.status(500).send({
          message: "Internal Server Error",
          detail: error,
          status: res.statusCode,
        });
      }
    }
  }

  async getDetailUserBooking(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);

    if (decodedToken) {
      const { transaction_id } = req.params;
      try {
        const bookingData = await this.bookingEventService.getDetailUserBooking(
          decodedToken.user_id,
          Number(transaction_id)
        );
        if (bookingData.code === BookingServiceCode.TransactionAvailable) {
          res.status(200).send({
            message: "User booking retrieved successfully",
            status: res.statusCode,
            data: bookingData,
          });
        } else if (bookingData.code === BookingServiceCode.NoTransactionFound) {
          res.status(404).send({
            message: bookingData.message,
            status: res.statusCode,
            errorCode: BookingServiceCode.NoTransactionFound,
          });
        } else if (bookingData.code === BookingServiceCode.Unauthorized) {
          res.status(403).send({
            message: bookingData.message,
            status: res.statusCode,
            errorCode: BookingServiceCode.Unauthorized,
          });
        } else {
          res.status(500).send({
            message: "Internal Server Error, Something went wrong",
            status: res.statusCode,
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "Internal Server Error",
          detail: error,
          status: res.statusCode,
        });
      }
    }
  }

  async createBookingEvent(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);

    if (decodedToken) {
      const { event_id, usePoint, payment_method, is_paid }: BookingData =
        req.body;

      const bookingData: BookingData = {
        user_id: decodedToken.user_id,
        event_id: event_id,
        usePoint: usePoint || 0,
        payment_method: payment_method,
        is_paid: is_paid,
      };

      try {
        const bookingEvent = await this.bookingEventService.createBookingEvent(
          bookingData
        );

        // Event is paid
        if (bookingEvent.code === BookingServiceCode.BookingCreated) {
          if (is_paid) {
            res.status(201).send({
              message: "Booking event successfully created",
              data: bookingEvent.newBooking,
              status: res.statusCode,
            });
          } else {
            // If the event is free, it will directly turn the booking status to paid
            const updateStatus =
              await this.bookingEventService.updateStatusToPaid(
                bookingEvent.newBooking?.transaction_id as number,
                decodedToken.user_id
              );
            if (updateStatus?.status === BookingServiceCode.UpdateToPaid) {
              res.status(200).send({
                message:
                  "Event successfully book and transaction status is already paid (FREE EVENT)",
                status: res.statusCode,
                code: BookingServiceCode.FreeEvent,
              });
            }
          }
        } else if (
          // Close Registration
          bookingEvent.code === BookingServiceCode.RegistarationClose
        ) {
          res.status(403).send({
            message: "Registration is closed",
            status: res.statusCode,
            errorCode: BookingServiceCode.RegistarationClose,
          });
        } else if (
          // Quota is full
          bookingEvent.code === BookingServiceCode.NAQuoata
        ) {
          res.status(409).send({
            message: "Event is full",
            status: res.statusCode,
            errorCode: BookingServiceCode.NAQuoata,
          });
        } else if (
          // Status transaction still waiting payment
          bookingEvent.code === BookingServiceCode.WaitingForPayment
        ) {
          res.status(403).send({
            message:
              "User already booking this event but still waiting for payment, complete it or cancel it to book this event again",
            status: res.statusCode,
            errorCode: BookingServiceCode.WaitingForPayment,
          });
        } else if (bookingEvent.code === BookingServiceCode.NotEnoughPoint) {
          res.status(409).send({
            message: "Not enough point to book this event",
            status: res.statusCode,
            errorCode: BookingServiceCode.NotEnoughPoint,
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "Internal Server Error",
          detail: error,
          status: res.statusCode,
        });
      }
    } else {
      res
        .status(401)
        .send({ message: "Invalid token", status: res.statusCode });
    }
  }

  async updateStatusToPaid(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);

    if (decodedToken) {
      const { transaction_id } = req.params;
      const user_id = decodedToken.user_id;

      try {
        const updateStatus = await this.bookingEventService.updateStatusToPaid(
          Number(transaction_id),
          user_id
        );

        if (updateStatus?.status === BookingServiceCode.UpdateToPaid) {
          res.status(200).send({
            message: updateStatus.message,
            status: res.statusCode,
          });
        } else if (
          // No transaction is found
          updateStatus?.status === BookingServiceCode.NoTransactionFound
        ) {
          res.status(404).send({
            message: updateStatus.message,
            status: res.statusCode,
          });
        } else if (
          // User is not authorized to update the transaction (user id in transaction is not the same in the token)
          updateStatus?.status === BookingServiceCode.Unauthorized
        ) {
          res.status(403).send({
            message: updateStatus.message,
            status: res.statusCode,
          });
        } else {
          res.status(500).send({
            message: "Failed to update status to paid",
            status: res.statusCode,
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "Failed to update status to paid",
          detail: error,
          status: res.statusCode,
        });
      }
    } else {
      res
        .status(401)
        .send({ message: "Invalid token", status: res.statusCode });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);

    if (decodedToken) {
      const { transaction_id } = req.params;
      const user_id = decodedToken.user_id;

      try {
        const updateStatus = await this.bookingEventService.cancelBooking(
          Number(transaction_id),
          user_id
        );
        if (updateStatus?.status === BookingServiceCode.UpdateToCanceled) {
          res.status(200).send({
            message: updateStatus.message,
            status: res.statusCode,
          });
        } else if (
          updateStatus?.status === BookingServiceCode.NoTransactionFound
        ) {
          res.status(404).send({
            message: updateStatus.message,
            status: res.statusCode,
          });
        } else if (updateStatus?.status === BookingServiceCode.Unauthorized) {
          res.status(403).send({
            message: updateStatus.message,
            status: res.statusCode,
          });
        }
      } catch (error) {}
    }
  }

  async bookingReview(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);

    if (decodedToken) {
      const {
        eventId,
        isAttend,
        review_content,
        review_rating,
        transaction_id,
      }: ReviewData = req.body;

      const reviewData: ReviewData = {
        transaction_id: transaction_id,
        userId: decodedToken.user_id,
        eventId: eventId,
        review_content: review_content,
        review_rating: review_rating,
        isAttend: isAttend,
      };

      try {
        const reviewBooking = await this.bookingEventService.bookingReview(
          reviewData
        );

        if (reviewBooking?.status === BookingServiceCode.BookingCreated) {
          res.status(201).send({
            message: reviewBooking.message,
            status: res.statusCode,
            data: reviewBooking.createReview,
          });
        } else if (
          reviewBooking?.status === BookingServiceCode.NoTransactionFound
        ) {
          res.status(404).send({
            message: reviewBooking.message,
            status: res.statusCode,
          });
        } else if (
          reviewBooking?.status === BookingServiceCode.TransactionisPaid
        ) {
          res.status(409).send({
            message: reviewBooking.message,
            status: res.statusCode,
          });
        } else if (
          reviewBooking?.status === BookingServiceCode.EventNotStartYet
        ) {
          res.status(409).send({
            message: reviewBooking.message,
            status: res.statusCode,
          });
        } else if (reviewBooking?.status === BookingServiceCode.Unauthorized) {
          res.status(403).send({
            message: reviewBooking.message,
            status: res.statusCode,
          });
        } else if (
          reviewBooking?.status === BookingServiceCode.FailedCreateReview
        ) {
          res.status(500).send({
            message: reviewBooking.message,
            status: res.statusCode,
          });
        } else {
          res.status(500).send({
            message: "Failed to create review",
            status: res.statusCode,
          });
        }
      } catch (error) {
        res.status(500).send({
          message: "Failed to create review",
          detail: error,
          status: res.statusCode,
        });
      }
    }
  }
}
