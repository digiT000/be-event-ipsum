import { PrismaClient, Prisma } from "@prisma/client";
import { EventResponse } from "../../models/admin.interface";

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllEvents() {
    // We conditionally create the cursor object based on whether lastCursor is defined.
    // If lastCursor is defined, we create a EventWhereUniqueInput object with the id field set to lastCursor.
    // If lastCursor is undefined, we set cursor to undefined, which will fetch the first 3 records.

    // Metode untuk mengambil semua acara dari database.
    const response = await this.prisma.event.findMany({
      take: 9,
      orderBy: {
        created_at: "desc",
      },
      include: {
        Category: true,
      },
    });

    // Remap the response
    const listEvent: EventResponse[] = response.map((event) => {
      return {
        event_id: event.event_id,
        event_name: event.event_name,
        categoryId: event.Category.category_id,
        category_name: event.Category.category_name,
        event_image: event.event_image,
        event_description: event.event_description,
        event_price: event.event_price,
        event_location: event.event_location,
        event_capacity: event.event_capacity,
        event_start_date: new Date(event.event_start_date).toLocaleDateString(),
        event_end_date: new Date(event.event_end_date).toLocaleDateString(),
        discounted_price: event.discounted_price,
        is_online: event.is_online,
        is_paid: event.is_paid,
      };
    });

    // Save the last id of the result
    const lastResponseId = listEvent[listEvent.length - 1].event_id;

    return {
      data: listEvent,
      lastCursor: lastResponseId,
    };
  }

  async loadMoreEvents(
    lastCursor: number,
    searchString?: string,
    categorySelected?: number
  ) {
    const whereClause: Prisma.EventWhereInput = {};
    if (searchString) {
      whereClause.event_name = {
        contains: searchString,
        mode: "insensitive",
      };
    }
    if (categorySelected) {
      whereClause.Category = {
        category_id: categorySelected,
      };
    }

    const response = await this.prisma.event.findMany({
      take: 9,
      skip: 1,
      cursor: {
        event_id: lastCursor,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        Category: true,
      },
      where: whereClause,
    });

    // Remap the response
    const listEvent: EventResponse[] = response.map((event) => {
      return {
        event_id: event.event_id,
        event_name: event.event_name,
        categoryId: event.Category.category_id,
        category_name: event.Category.category_name,
        event_image: event.event_image,
        event_description: event.event_description,
        event_price: event.event_price,
        event_location: event.event_location,
        event_capacity: event.event_capacity,
        event_start_date: new Date(event.event_start_date).toLocaleDateString(),
        event_end_date: new Date(event.event_end_date).toLocaleDateString(),
        discounted_price: event.discounted_price,
        is_online: event.is_online,
        is_paid: event.is_paid,
      };
    });
    if (listEvent.length === 0) {
      return {
        data: [],
        lastCursor: -1,
      };
    }
    // Save the last id of the result
    const lastResponseId = listEvent[listEvent.length - 1].event_id;

    return {
      data: listEvent,
      lastCursor: lastResponseId,
    };
  }

  async getEventById(event_id: number): Promise<EventResponse | undefined> {
    // Metode untuk mengambil acara berdasarkan ID.
    const response = await this.prisma.event.findUnique(
      // Mencari acara yang unik berdasarkan ID yang diberikan.
      {
        include: {
          Category: true,
        },

        where: { event_id: event_id },
      }
    ); // Menentukan kondisi pencarian berdasarkan event_id.
    if (response) {
      return {
        event_id: response.event_id,
        event_name: response.event_name,
        categoryId: response.Category.category_id,
        category_name: response.Category.category_name,
        event_image: response.event_image,
        event_description: response.event_description,
        event_price: response.event_price,
        event_location: response.event_location,
        event_capacity: response.event_capacity,
        event_start_date: new Date(
          response.event_start_date
        ).toLocaleDateString(),
        event_end_date: new Date(response.event_end_date).toLocaleDateString(),
        discounted_price: response.discounted_price,
        is_online: response.is_online,
        is_paid: response.is_paid,
      };
    } else {
      return undefined;
    }
  }

  async getEventBySearch(searchString?: string, categorySelected?: number) {
    // Return all events if no search string or category is provided.
    // Return events matching a specific search string if provided.
    // Return events matching a specific category if provided.
    // Return events matching both search string and category if both are provided.
    const whereClause: Prisma.EventWhereInput = {};

    // If search string is provided, it will search event based on search string
    if (searchString) {
      whereClause.event_name = {
        contains: searchString,
        mode: "insensitive",
      };
    }

    if (categorySelected) {
      whereClause.Category = {
        category_id: categorySelected,
      };
    }

    const response = await this.prisma.event.findMany({
      take: 3,
      orderBy: {
        created_at: "desc",
      },
      include: {
        Category: true,
      },
      where: whereClause,
    });

    if (response.length !== 0) {
      const listEvent: EventResponse[] = response.map((event) => {
        return {
          event_id: event.event_id,
          event_name: event.event_name,
          categoryId: event.Category.category_id,
          category_name: event.Category.category_name,
          event_image: event.event_image,
          event_description: event.event_description,
          event_price: event.event_price,
          event_location: event.event_location,
          event_capacity: event.event_capacity,
          event_start_date: new Date(
            event.event_start_date
          ).toLocaleDateString(),
          event_end_date: new Date(event.event_end_date).toLocaleDateString(),
          discounted_price: event.discounted_price,
          is_online: event.is_online,
          is_paid: event.is_paid,
        };
      });
      // Save the last id of the result
      const lastResponseId = listEvent[listEvent.length - 1].event_id;
      return {
        data: listEvent,
        lastCursor: lastResponseId,
      };
    } else {
      return {
        data: [],
        lastCursor: -1,
      };
    }
  }

  async getAllCategory() {
    const response = await this.prisma.category_Event.findMany();
    if (response) {
      return response;
    }
  }
}
