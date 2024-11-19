import express from "express";
import environment from "dotenv";
import authRouter from "./routers/user.routers/auth.router";
import referralRouter from "./routers/user.routers/referral.router";
import cors from "cors";
import adminRouter from "./routers/admin.routers/admin.router";
import userRouter from "./routers/user.routers/user.router";
import bookingEventRouter from "./routers/user.routers/bookingEvent.router";
import authAdminRouter from "./routers/admin.routers/auth.router";

environment.config();

const app = express();
const PORT = process.env.SERVER_PORT_DEV;

app.use(express.json());
app.use(
  cors({
    origin: "https://event-ipsum.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);
// jalur utama dari api
app.use("/api/auth", authRouter);
app.use("/api/referral", referralRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth-admin", authAdminRouter);
app.use("/api/users", userRouter);

app.use("/api/bookings", bookingEventRouter);

app.listen(PORT, () => {
  console.log(`Listening on port : ${PORT}`);
});
