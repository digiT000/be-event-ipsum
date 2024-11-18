import { Router } from "express";
import { ReferralContoller } from "../../controllers/user.controllers/referral.controller";
import { AuthMiddleware } from "../../middlewares/user.middleware/auth.middleware";

const router = Router();
const referralController = new ReferralContoller();
const authMiddleware = new AuthMiddleware();

router.put(
  "/use-referral/:referral_code",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("user").bind(authMiddleware),
  referralController.useReferral.bind(referralController)
);

export default router;
