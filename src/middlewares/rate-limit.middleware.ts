import { Request, Response, NextFunction } from "express";

interface RequestData {
  count: number;
  lastRequestTime: number;
}

const requestCounts: { [key: string]: RequestData } = {};
const RATE_LIMIT = 3;
const TIME_WINDOW = 60 * 1000;

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const adminId = (req as any).user?.id;

  if (!adminId) {
    res.status(403).json({ message: "Unauthorized access" });
  }

  const currentTime = Date.now();

  if (!requestCounts[adminId]) {
    requestCounts[adminId] = { count: 0, lastRequestTime: currentTime };
  }

  const adminData = requestCounts[adminId];
  if (currentTime - adminData.lastRequestTime > TIME_WINDOW) {
    adminData.count = 0;
    adminData.lastRequestTime = currentTime;
  }

  if (adminData.count >= RATE_LIMIT) {
    res
      .status(429)
      .json({ message: "Too many requests. Please try again later." });
  }

  adminData.count += 1;
  adminData.lastRequestTime = currentTime;

  next();
}
