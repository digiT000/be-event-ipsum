import { PrismaClient } from "@prisma/client";
import { AuthProps } from "../../models/user.interface";
import { ReferralService } from "./referral.service";
import bcrypt from "bcryptjs";
import { AuthUtils } from "../../utils/auth.utils";

// Create Class for Auth Services
export class AuthService {
  private prisma: PrismaClient;
  private authUtil: AuthUtils;
  private referralService: ReferralService;
  constructor() {
    this.prisma = new PrismaClient();
    this.authUtil = new AuthUtils();
    this.referralService = new ReferralService();
  }

  // USER REGISTRATION
  async registerUser(data: AuthProps) {
    // Check user email is already in db or not
    const checkEmail = await this.prisma.users.findUnique({
      where: {
        email: data.email,
      },
    });
    if (checkEmail) {
      return { code: "AU", status: 400, message: "Email already registered" };
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // GENERATE and create referral
    //const referralResponse = await this.referralService.()

    try {
      const referralResponse = await this.referralService.createUserReferral(
        data.name
      );
      if (referralResponse) {
        const response = await this.prisma.users.create({
          data: {
            name: data.name,
            email: data.email,
            userReferralId: referralResponse.user_referral_id,
            password: hashedPassword,
            user_role: data.role,
            points: 0,
          },
        });
        return {
          status: 201,
          data: {
            user: response,
            referral: referralResponse,
          },
        };
      }
    } catch (error) {
      return {
        status: 400,
        message: "Failed to create referral",
      };
    }
  }

  async loginUser(email: string, password: string) {
    // GET DATA USER BASED ON EMAIL
    const user = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    // CHECK IF THE USER IS AVAILABLE
    if (!user) {
      return {
        code: "IN",
        status: 404,
        message: "invalid email",
      };
    }
    // CHECK THE PASSWORD
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return {
        code: "IN",
        status: 404,
        message: "Invalid password",
      };
    }

    // CHECK THE ROLE
    if (user.user_role === "admin") {
      return {
        code: "IN",
        status: 401,
        message: "Cannot login with admin account",
      };
    }

    // Generate Token
    const { refreshToken, accessToken } =
      await this.authUtil.generateLoginToken(
        user.user_id,
        email,
        user.user_role
      );

    // Update data refresh token for user
    const updatedUser = await this.prisma.users.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        refresh_token: refreshToken,
      },
    });
    return {
      status: 200,
      data: {
        name: updatedUser.name,
        userReferralId: updatedUser.userReferralId,
        referral_use: updatedUser.referral_use,
        points: updatedUser.points,
        user_role: updatedUser.user_role,
        refresh_token: updatedUser.refresh_token,
        access_token: accessToken,
      },
    };
  }

  async refreshAccessToken(token: string) {
    // Decode refresh token to get id
    // check if the user of the token is available in data base
    // if the user available, check whether the token is match
    // generate a new access token

    // Decode refresh token
    const decodedToken = await this.authUtil.decodeToken(token);
    if (!decodedToken) {
      return {
        errorCode: "IT",
        message: "Invalid token",
      };
    }
    const { email, user_id } = decodedToken;

    // Check user is available based on id
    const user = await this.prisma.users.findUnique({
      where: {
        user_id: user_id,
        email: email,
      },
    });
    if (!user) {
      return {
        errorCode: "UNF",
        message: "User not found",
      };
    }

    // Check if the refresh token is match wiyh the user
    if (user.refresh_token !== token) {
      return {
        errorCode: "IRT",
        message: "Invalid refresh token",
      };
    }

    // generate new token
    const accessToken = await this.authUtil.generateAccessToken(
      user_id,
      email,
      user.user_role
    );
    return { code: "GUT", accessToken, user_role: user.user_role };
  }

  // /api/auth/validate-token
  async validateToken(token: string) {
    // Decode refresh token
    const decodedToken = await this.authUtil.decodeToken(token);
    if (!decodedToken) {
      return {
        status: 400,
        message: "Invalid token",
      };
    }
    const { email, user_id } = decodedToken;

    // Check user is available based on id
    const user = await this.prisma.users.findUnique({
      where: {
        user_id: user_id,
        email: email,
      },
      include: {
        user_referral: true,
      },
    });
    if (!user) {
      return {
        message: "User not found",
      };
    } else {
      return {
        status: 200,
        data: user,
      };
    }
  }

  async logoutUser(user_id: number) {
    // Update refresh token to null
    try {
      const user = await this.prisma.users.update({
        where: {
          user_id: user_id,
        },
        data: {
          refresh_token: null,
        },
      });

      return {
        status: 200,
        data: user,
      };
    } catch (error) {
      return { status: 404 };
    }
  }
}
