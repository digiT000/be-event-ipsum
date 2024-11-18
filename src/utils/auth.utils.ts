import { Request } from "express";
import environment from "dotenv";
import jwt from "jsonwebtoken";
import { TokenPayloadProps } from "../models/user.interface";

environment.config();
const SECRET_KEY = process.env.SECRET_KEY as string;

export class AuthUtils {
  async generateLoginToken(user_id: number, email: string, user_role: string) {
    const accessToken = await this.generateAccessToken(
      user_id,
      email,
      user_role
    );
    // Token that will be store, and will be used to refresh the usedAcessToken
    const refreshToken = jwt.sign(
      {
        user_id: user_id,
        email: email,
      },
      SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    return { accessToken, refreshToken };
  }
  async decodeToken(token: string) {
    try {
      const decodedToken = (await jwt.verify(
        token,
        SECRET_KEY
      )) as TokenPayloadProps;
      return decodedToken
        ? { user_id: decodedToken.user_id, email: decodedToken.email }
        : undefined;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  async generateAccessToken(user_id: number, email: string, user_role: string) {
    // Regenerate token using refresh token
    // If refresh token is valid, generate new access token and refresh token
    // If refresh token is invalid, return error message

    const accessToken = jwt.sign(
      {
        user_id: user_id,
        email: email,
        user_role: user_role,
      },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    return accessToken;
  }

  async getAuthenticatedUser(req: Request) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const decodedToken = await this.decodeToken(accessToken);
    return decodedToken;
  }
}
