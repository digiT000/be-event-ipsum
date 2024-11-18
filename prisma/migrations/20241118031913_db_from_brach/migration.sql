-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "techevent";

-- CreateTable
CREATE TABLE "techevent"."Users" (
    "user_id" SERIAL NOT NULL,
    "userReferralId" INTEGER NOT NULL,
    "referral_use" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "user_role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refresh_token" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "techevent"."User_Referral" (
    "user_referral_id" SERIAL NOT NULL,
    "limit_use" INTEGER NOT NULL DEFAULT 3,
    "total_use" INTEGER NOT NULL,
    "referral_code" TEXT NOT NULL,

    CONSTRAINT "User_Referral_pkey" PRIMARY KEY ("user_referral_id")
);

-- CreateTable
CREATE TABLE "techevent"."Transaction" (
    "transaction_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_order" TEXT NOT NULL,
    "payment_ammount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "is_Discount" BOOLEAN NOT NULL,
    "usePoint" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "techevent"."Event" (
    "event_id" SERIAL NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_image" TEXT NOT NULL,
    "event_description" TEXT NOT NULL,
    "event_price" DOUBLE PRECISION NOT NULL,
    "event_location" TEXT NOT NULL,
    "event_capacity" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "event_start_date" TIMESTAMP(3) NOT NULL,
    "event_end_date" TIMESTAMP(3) NOT NULL,
    "discounted_price" DOUBLE PRECISION NOT NULL,
    "is_online" BOOLEAN NOT NULL,
    "is_paid" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "techevent"."Category_Event" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_Event_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "techevent"."Review" (
    "review_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "review_content" TEXT NOT NULL,
    "review_rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "techevent"."Dicount_Event" (
    "discount_id" SERIAL NOT NULL,
    "discount_percentage" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dicount_Event_pkey" PRIMARY KEY ("discount_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_userReferralId_key" ON "techevent"."Users"("userReferralId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "techevent"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Referral_referral_code_key" ON "techevent"."User_Referral"("referral_code");

-- AddForeignKey
ALTER TABLE "techevent"."Users" ADD CONSTRAINT "Users_userReferralId_fkey" FOREIGN KEY ("userReferralId") REFERENCES "techevent"."User_Referral"("user_referral_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techevent"."Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "techevent"."Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techevent"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "techevent"."Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techevent"."Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "techevent"."Category_Event"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techevent"."Event" ADD CONSTRAINT "Event_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "techevent"."Dicount_Event"("discount_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techevent"."Review" ADD CONSTRAINT "Review_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "techevent"."Event"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "techevent"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "techevent"."Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
