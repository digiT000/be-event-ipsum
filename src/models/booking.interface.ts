export interface BookingData {
  user_id: number;
  is_paid: boolean;
  event_id: number;
  usePoint: number;
  payment_method: "QRIS" | "bank bca" | "bca_virtual account";
}

export interface ReviewData {
  transaction_id: number;
  userId: number;
  eventId: number;
  review_content: string;
  review_rating: number;
  isAttend: boolean;
}

export enum BookingStatus {
  Canceled = "Canceled",
  WaitingForPayment = "Waiting Payment",
  Paid = "Paid",
  Completed = "Completed",
}

export enum BookingServiceCode {
  FailedCreateReview = "FCR",
  TransactionAvailable = "TA",
  BookingCreated = "BC",
  NAQuoata = "NAQ",
  RegistarationClose = "RC",
  WaitingForPayment = "WFP",
  TransactionisPaid = "TIP",
  NoTransactionFound = "NOF",
  UpdateToPaid = "UP",
  UpdateToCanceled = "UC",
  Unauthorized = "UT",
  FreeEvent = "FREE",
  NotEnoughPoint = "NEP",
  EventNotStartYet = "ENS",
}
