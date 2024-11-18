import { Router } from "express";
import { AdminController } from "../../controllers/admin.controllers/admin.event.controller";
import { AdminListUser } from "../../controllers/admin.controllers/admin.list.user.controller";
import { AdminDashboardController } from "../../controllers/admin.controllers/admin.dashboard.controller";
import { EventAdminMiddleware } from "../../middlewares/admin.middleware/event.middleware";
import { AuthMiddleware } from "../../middlewares/user.middleware/auth.middleware";
import upload from "../../middlewares/upload.middleware";

const router = Router();
const authMiddleware = new AuthMiddleware();
const eventAdminMiddleware = new EventAdminMiddleware();
const adminListUser = new AdminListUser();
const adminController = new AdminController();
const adminDashboardController = new AdminDashboardController();

router.get(
  "/dashboard/total-users",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminDashboardController.getUserCount.bind(adminDashboardController)
);

router.get(
  "/dashboard/total-registration",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminDashboardController.getAnalyticMonthlyRegistration.bind(
    adminDashboardController
  )
);

router.get(
  "/dashboard/total-listevents",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminDashboardController.getTotalListEvents.bind(adminDashboardController)
);

router.get(
  "/dashboard/total-montly-transaction",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminDashboardController.getMonthlyTransaction.bind(adminDashboardController)
);

router.get(
  "/dashboard/total-transaction",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminDashboardController.getTotalTransaction.bind(adminDashboardController)
);

router.get(
  "/dashboard/total-transaction-value",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminDashboardController.getTotalTransactionValue.bind(
    adminDashboardController
  )
);

router.get(
  "/events",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminController.getAllEvents.bind(adminController)
);

router.get(
  "/events/:id",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminController.getEventById.bind(adminController)
);

router.get(
  "/list-users",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminListUser.getAllUsers.bind(adminListUser)
);

router.post(
  "/events",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  upload.single("event_image"),
  eventAdminMiddleware.validateCreateEventInput.bind(eventAdminMiddleware),
  adminController.createEvent.bind(adminController)
);

router.put(
  "/events/:id",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  upload.single("event_image"),
  eventAdminMiddleware.validateEventUpdateInput.bind(eventAdminMiddleware),
  adminController.updateEvent.bind(adminController)
);

router.delete(
  "/events/:id",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminController.deleteEvent.bind(adminController)
);

router.get(
  "/events-search",
  authMiddleware.validateToken.bind(authMiddleware),
  authMiddleware.authorizeRole("admin").bind(authMiddleware),
  adminController.getEventBySearch.bind(adminController)
);

export default router;
