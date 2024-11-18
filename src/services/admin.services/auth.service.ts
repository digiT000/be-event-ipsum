import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthUtils } from "../../utils/auth.utils";

interface LoginData {
  email: string;
  password: string;
}

export class AuthAdminService {
  private prisma: PrismaClient;
  private authUtil: AuthUtils;

  constructor() {
    this.prisma = new PrismaClient();
    this.authUtil = new AuthUtils();
  }

  async adminLoginAuth(email: string, password: string) {
    try {
      const checkUser = await this.prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (!checkUser) {
        return {
          errorCode: "UNF",
          message: "Please check password or email",
        };
      }

      // CHECK THE PASSWORD
      const matchPassword = await bcrypt.compare(password, checkUser.password);
      if (!matchPassword) {
        return {
          code: "UNF",
          message: "Please check password or email",
        };
      }

      if (checkUser.user_role !== "admin") {
        return {
          errorCode: "UT",
          message: "You are not authorized to access this admin panel",
        };
      }

      // Generate Token
      const { refreshToken, accessToken } =
        await this.authUtil.generateLoginToken(
          checkUser.user_id,
          email,
          checkUser.user_role
        );

      // Update data refresh token for user
      const updatedUser = await this.prisma.users.update({
        where: {
          user_id: checkUser.user_id,
        },
        data: {
          refresh_token: refreshToken,
        },
      });
      return {
        code: "SUCCESS",
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
    } catch (error) {}
  }
}
