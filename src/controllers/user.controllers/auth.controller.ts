import { Request, Response } from "express";
import { AuthStatusResponseCode } from "../../models/auth.interface";

import { AuthService } from "../../services/user.services/auth.service";
import { AuthUtils } from "../../utils/auth.utils";

export class AuthController {
  private authService: AuthService;
  private authUtils: AuthUtils;
  constructor() {
    this.authService = new AuthService();
    this.authUtils = new AuthUtils();
  }

  async registerUser(req: Request, res: Response) {
    const response = await this.authService.registerUser(req.body);
    if (response?.status === 201) {
      res.status(201).send({
        message: "User registered successfully",
        data: response,
        status: res.statusCode,
      });
    } else {
      res.status(400).send({
        message: "Failed to register user",
        details: response?.message,
        data: response,
        status: res.statusCode,
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
    const response = await this.authService.loginUser(email, password);
    if (response.status === 200) {
      res.status(200).send({
        message: "User logged in successfully",
        data: {
          user: response.data,
          access_token: response.data?.access_token,
        },
        status: res.statusCode,
      });
    } else {
      res.status(401).send({
        message: "Invalid email or password",
        detail: response.message,
        data: response.data,
        status: res.statusCode,
      });
    }
  }

  async refreshAccessToken(req: Request, res: Response) {
    const refresh_token = req.headers.authorization?.split(" ")[1];

    const response = await this.authService.refreshAccessToken(
      refresh_token as string
    );
    if (response.code === AuthStatusResponseCode.SuccessGenerateUserToken) {
      res.status(200).send({
        message: "Access token refreshed successfully",
        data: response,
        status: res.statusCode,
      });
    } else if (
      response.errorCode === AuthStatusResponseCode.InvalidRefreshToken
    ) {
      res.status(401).send({
        message: "Invalid refresh token",
        data: response,
        status: res.statusCode,
      });
    } else if (response.errorCode === AuthStatusResponseCode.UserNotFound) {
      res.status(404).send({
        message: "User not found",
        status: res.statusCode,
      });
    } else if (response.errorCode === AuthStatusResponseCode.InvalidToken) {
      res.status(401).send({
        message: "Invalid token",
        data: response,
        status: res.statusCode,
      });
    }
  }

  async logoutUser(req: Request, res: Response) {
    // Decoded Token
    const decodedToken = await this.authUtils.getAuthenticatedUser(req);
    if (decodedToken) {
      const response = await this.authService.logoutUser(decodedToken.user_id);
      if (response.status === 200) {
        res.status(200).send({
          message: "User logged out successfully",
          status: res.statusCode,
        });
      } else {
        res.status(404).send({
          message: "Failed to log out user",
          status: res.statusCode,
        });
      }
    }
  }
  async validateToken(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];
    const response = await this.authService.validateToken(token as string);
    if (response.status === 200) {
      res.status(200).send({
        message: "Token is valid",
        data: response.data,
        status: res.statusCode,
      });
    } else {
      res.status(401).send({
        message: "Invalid token",
        data: response,
        status: res.statusCode,
      });
    }
  }
}
