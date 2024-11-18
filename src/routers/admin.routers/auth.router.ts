import { Router } from "express";
import { AuthAdminController } from "../../controllers/admin.controllers/auth.controller";

const router = Router();
const authAdminController = new AuthAdminController();

router.post(
  "/login",
  authAdminController.adminLoginAuth.bind(authAdminController)
);

export default router;
