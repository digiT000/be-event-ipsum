import { Router } from "express";
import { UserController } from "../../controllers/user.controllers/event.controller";

const router = Router();
const userController = new UserController();

router.get("/events", userController.getAllEvents.bind(userController));
// router.get("/events/:category", userController.getEventCategory.bind(userController));
router.get("/events/:id", userController.getEventById.bind(userController));
router.get(
  "/search-events",
  userController.getEventBySearch.bind(userController)
);
router.get("/load-more", userController.loadMoreEvents.bind(userController));
router.get("/categories", userController.getAllCategory.bind(userController));

export default router;
