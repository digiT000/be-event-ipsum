import { Request, Response } from "express";
import { AuthAdminService } from "../../services/admin.services/auth.service";

export class AuthAdminController {
  private authAdminService: AuthAdminService;
  constructor() {
    this.authAdminService = new AuthAdminService();
  }

  async adminLoginAuth(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const response = await this.authAdminService.adminLoginAuth(
        email,
        password
      );

      if (response?.code === "SUCCESS") {
        res.status(200).send({
          message: "User logged in successfully",
          data: {
            user: response.data,
            access_token: response.data?.access_token,
          },
          status: res.statusCode,
        });
      } else if (response?.errorCode === "UNF") {
        res.status(401).send({
          message: response.message,
          status: res.statusCode,
        });
      } else if (response?.errorCode === "UT") {
        res.status(403).send({
          message: response.message,
          status: res.statusCode,
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Internal Server Error",
        status: res.statusCode,
      });
    }
  }
}
