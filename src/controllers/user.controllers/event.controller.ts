import { Request, Response } from "express";
import { UserService } from "../../services/user.services/event.service";

export class UserController {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  async getAllEvents(req: Request, res: Response) {
    const getEvents = await this.userService.getAllEvents();
    if (getEvents) {
      res.status(200).send({
        data: getEvents.data,
        cursor: getEvents.lastCursor,
        status: res.statusCode,
      });
    } else {
      res.status(404).send({
        message: "Failed to fetch events",
        status: res.statusCode,
        details: res.statusMessage,
      });
    }
  }
  async loadMoreEvents(req: Request, res: Response) {
    // Handle Load more from search also
    const lastCursor = req.query.cursor as string;
    const searchString = req.query.search as string;
    let selectedCategory =
      req.query.category === "0" ? undefined : Number(req.query.category);

    const getEvents = await this.userService.loadMoreEvents(
      Number(lastCursor),
      searchString,
      selectedCategory
    );
    if (getEvents) {
      res.status(200).send({
        data: getEvents.data,
        cursor: getEvents.lastCursor,
        status: res.statusCode,
      });
    } else {
      res.status(404).send({
        message: "Failed to fetch events",
        status: res.statusCode,
        details: res.statusMessage,
      });
    }
  }

  async getEventById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const event = await this.userService.getEventById(id);
    if (event) {
      res.status(200).send({
        message: `Event with id ${id} retrieved successfully`,
        status: res.statusCode,
        data: event,
      });
    } else {
      res.status(404).send({
        message: `Event id ${id} not found`,
        status: res.statusCode,
      });
    }
  }

  async getEventBySearch(req: Request, res: Response) {
    const searchString = req.query.search as string;
    let selectedCategory =
      req.query.category === "0" ? undefined : Number(req.query.category);

    const events = await this.userService.getEventBySearch(
      searchString,
      selectedCategory
    );
    if (events) {
      res.status(200).send({
        data: events.data,
        cursor: events.lastCursor,
        status: res.statusCode,
      });
    } else {
      res.status(404).send({
        message: "Failed to fetch events",
        status: res.statusCode,
        details: res.statusMessage,
      });
    }
  }
  async getAllCategory(req: Request, res: Response) {
    const category = await this.userService.getAllCategory();
    if (category) {
      res.status(200).send({
        data: category,
        status: res.statusCode,
      });
    } else {
      res.status(404).send({
        message: "Failed to fetch categories",
        status: res.statusCode,
        details: res.statusMessage,
      });
    }
  }
}
