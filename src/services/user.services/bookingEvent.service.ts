import {
  BookingData,
  BookingStatus,
  BookingServiceCode,
} from "../../models/booking.interface";
import { PrismaClient } from "@prisma/client";
import { ReviewData } from "../../models/booking.interface";

export class BookingEventService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserbookings(user_id: number) {
    // 1. Check if user exist
    const bookings = await this.prisma.users.findUnique({
      where: { user_id: user_id },
      include: {
        transaction: {
          include: {
            Event: true,
          },
        },
      },
    });
    if (!bookings) {
      throw new Error("User not found");
    } else {
      return bookings.transaction;
    }

    // // 2. Get all booking records that related to the user
    // const bookings = await this.prisma.users.findUnique({
    //   where: {
    //     user_id: user_id,
    //   },
    //   include: {
    //     transaction: true,
    //   },
    // });
  }

  async getDetailUserBooking(user_id: number, transaction_id: number) {
    // Check transaction and make sure the owner of the transaction is same as the user_id we passing
    const transaction = await this.prisma.transaction.findUnique({
      where: {
        transaction_id: transaction_id,
      },
      include: {
        Event: {
          select: {
            Category: {
              select: {
                category_name: true,
              },
            },
            event_image: true,
            event_name: true,
            event_start_date: true,
            is_online: true,
            event_description: true,
            event_location: true,
            event_end_date: true,
          },
        },
      },
    });
    if (!transaction) {
      return {
        code: BookingServiceCode.NoTransactionFound,
        message: "Transaction not found",
      };
    } else if (transaction.userId !== user_id) {
      return {
        code: BookingServiceCode.Unauthorized,
        message: "User not authorized to access this transaction",
      };
    } else {
      return {
        code: BookingServiceCode.TransactionAvailable,
        transaction,
      };
    }
  }

  async createBookingEvent(bookingData: BookingData) {
    // 1. Make sure the user that booking is exist
    // 2. Make sure the event that user booking is exist
    // 3. Check if the event is still have quota and its stil able to registration (start data)
    // 4. Create a new booking record in the database
    // 5. Decrease the quota of the event
    // 6. Return the booking status and service code

    // 1. Check if user exist
    const user = await this.prisma.users.findUnique({
      where: { user_id: bookingData.user_id },
    });
    if (!user) {
      throw new Error("User not found");
    }

    // 2. Check if event exist
    const event = await this.prisma.event.findUnique({
      where: {
        event_id: bookingData.event_id,
      },
      include: {
        Discount: true,
      },
    });
    if (!event) {
      throw new Error("Event not found");
    }

    // Check are the user already joined to the event
    // 1. if the status of transaction is pending user not able to join
    // 2. If the status transaction already failed user able to apply again

    try {
      const checkUserJoined = await this.prisma.transaction.findFirst({
        where: {
          AND: [
            {
              eventId: {
                equals: bookingData.event_id,
              },
            },
            {
              userId: {
                equals: bookingData.user_id,
              },
            },
            {
              status_order: BookingStatus.WaitingForPayment,
            },
          ],
        },
      });

      // Check if the user is already join or not with the status still waiting for payment
      if (checkUserJoined) {
        if (checkUserJoined.status_order === BookingStatus.WaitingForPayment) {
          return {
            code: BookingServiceCode.WaitingForPayment,
            message: "User already joined to the event but not yet paid",
          };
        }
      }
    } catch (error) {
      return {
        message: "Failed to check user joined or not",
      };
    }

    // 3. Check if event is still have quota and its still able to registration
    const eventStartDate = new Date(event.event_start_date);
    const currentDate = new Date();

    if (currentDate > eventStartDate) {
      return {
        code: BookingServiceCode.RegistarationClose,
        message: "Registration close",
      };
    }

    if (event.event_capacity === 0) {
      return {
        code: BookingServiceCode.NAQuoata,
        message: "Event is full",
      };
    }

    // 4. Check if the user use point, check the point balance are the user have it or not
    if (bookingData.usePoint > user.points && bookingData.is_paid) {
      return {
        code: BookingServiceCode.NotEnoughPoint,
        message: "User don't have enough point",
      };
    }

    // 4. Create a new booking record in the database
    const finalAmmount = event.Discount.is_active
      ? bookingData.usePoint === 0
        ? event.discounted_price
        : event.discounted_price - bookingData.usePoint
      : bookingData.usePoint === 0
        ? event.event_price
        : event.event_price - bookingData.usePoint;

    const newBooking = await this.prisma.transaction.create({
      data: {
        userId: bookingData.user_id,
        eventId: bookingData.event_id,
        usePoint: bookingData.usePoint,
        payment_ammount: bookingData.is_paid ? finalAmmount : 0,
        payment_method: bookingData.payment_method,
        is_Discount: event.Discount.is_active,
        status_order: BookingStatus.WaitingForPayment,
        order_date: currentDate,
      },
    });

    // 5. Decrease the quota of the event
    await this.prisma.event.update({
      where: {
        event_id: bookingData.event_id,
      },
      data: {
        event_capacity: {
          decrement: 1,
        },
      },
    });

    // 5. Decrement the user point if the book use point
    if (bookingData.usePoint !== 0 && bookingData.is_paid !== false) {
      await this.prisma.users.update({
        where: {
          user_id: bookingData.user_id,
        },
        data: {
          points: {
            decrement: bookingData.usePoint,
          },
        },
      });
    }

    return {
      code: BookingServiceCode.BookingCreated,
      newBooking,
    };
  }

  async updateStatusToPaid(transaction_id: number, user_id: number) {
    // 1.Make sure the transaction is exist in Database
    // 2. Make sure the user of the request own the transaction
    // 3. Update the status of transaction to paid

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        transaction_id: transaction_id,
      },
    });
    if (!transaction) {
      return {
        status: BookingServiceCode.NoTransactionFound,
        message: "Transaction not found",
      };
    } else if (transaction.userId !== user_id) {
      return {
        status: BookingServiceCode.Unauthorized,
        message: "User not authorized to update this transaction",
      };
    } else if (transaction.status_order !== BookingStatus.WaitingForPayment) {
      return {
        status: BookingServiceCode.NoTransactionFound,
        message: "Transaction status is not waiting for payment",
      };
    }

    try {
      const updateTransaction = await this.prisma.transaction.update({
        where: {
          transaction_id: transaction_id,
        },
        data: {
          status_order: BookingStatus.Paid,
        },
      });
      return {
        data: updateTransaction,
        status: BookingServiceCode.UpdateToPaid,
        message: "Transaction updated to paid",
      };
    } catch (error) {
      return {
        message: "Error updating transaction",
      };
    }
  }

  async cancelBooking(transaction_id: number, user_id: number) {
    // 1.Make sure the transaction is exist in Database
    // 2. Make sure the user of the request own the transaction
    // 3. Update the status of transaction to paid

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        transaction_id: transaction_id,
      },
    });
    if (!transaction) {
      return {
        status: BookingServiceCode.NoTransactionFound,
        message: "Transaction not found",
      };
    } else if (transaction.userId !== user_id) {
      return {
        status: BookingServiceCode.Unauthorized,
        message: "User not authorized to update this transaction",
      };
    } else if (
      transaction.status_order === BookingStatus.Paid ||
      transaction.status_order === BookingStatus.Completed
    ) {
      return {
        status: BookingServiceCode.NoTransactionFound,
        message:
          "Transaction with status paid or completed or cancelled cannot be cancelled",
      };
    } else if (transaction.status_order === BookingStatus.Canceled) {
      return {
        status: BookingServiceCode.NoTransactionFound,
        message: "This transaction already cancel",
      };
    }

    try {
      const updateTransaction = await this.prisma.transaction.update({
        where: {
          transaction_id: transaction_id,
        },
        data: {
          status_order: BookingStatus.Canceled,
          Event: {
            update: {
              event_capacity: {
                increment: 1,
              },
            },
          },
          Users: {
            update: {
              points: {
                increment:
                  transaction.usePoint === 0 ? 0 : transaction.usePoint,
              },
            },
          },
        },
        include: {
          Event: true,
          Users: true,
        },
      });

      return {
        data: updateTransaction,
        status: BookingServiceCode.UpdateToCanceled,
        message: "Transaction updated to canceled",
      };
    } catch (error) {
      return {
        message: "Failed to update transaction",
      };
    }
  }

  async bookingReview(reviewData: ReviewData) {
    // 1. Make sure the transaction is exist in Database
    // 2. Make sure the user and the event is exactly the same with in the transaction
    // 3. If value isAttend is false
    // 4. Create a new review for the transaction
    // 5. but with the value rating and description is null
    // 6. change status to completed
    // 7. If the isAttend is true
    // 9. Create a new review for the transaction
    // 10. Change status booking to completed

    const currentDate = new Date();

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        transaction_id: reviewData.transaction_id,
      },
      include: {
        Event: true,
        Users: true,
      },
    });

    if (!transaction) {
      return {
        status: BookingServiceCode.NoTransactionFound,
        message: "Transaction not found",
      };
    }
    if (transaction.status_order !== BookingStatus.Paid) {
      return {
        status: BookingServiceCode.TransactionisPaid,
        message: "Transaction status is not paid",
      };
    }
    if (currentDate < transaction.Event.event_start_date) {
      return {
        status: BookingServiceCode.EventNotStartYet,
        message: "Cannot Review, This event has not started yet",
      };
    }
    if (
      transaction.Users.user_id !== reviewData.userId ||
      transaction.Event.event_id !== reviewData.eventId
    ) {
      return {
        status: BookingServiceCode.Unauthorized,
        message: "User or event not match with transaction",
      };
    }

    try {
      const createReview = await this.prisma.review.create({
        data: {
          eventId: reviewData.eventId,
          userId: reviewData.userId,
          review_rating: reviewData.isAttend ? reviewData.review_rating : -1,
          review_content: reviewData.isAttend ? reviewData.review_content : "",
          created_at: new Date(),
        },
      });
      if (!createReview) {
        return {
          status: BookingServiceCode.FailedCreateReview,
          message: "Failed to create review",
        };
      }
      const updateTransaction = await this.prisma.transaction.update({
        where: {
          transaction_id: reviewData.transaction_id,
        },
        data: {
          status_order: BookingStatus.Completed,
        },
      });
      if (!updateTransaction) {
        return {
          status: BookingServiceCode.FailedCreateReview,
          message: "Failed to update transaction status",
        };
      }
      return {
        status: BookingServiceCode.BookingCreated,
        message: "Booking review successfully",
        createReview,
      };
    } catch (error) {
      return {
        status: BookingServiceCode.FailedCreateReview,
        message: "Failed to create review",
      };
    }
  }
}
