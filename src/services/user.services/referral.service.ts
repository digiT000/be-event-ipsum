import { PrismaClient } from "@prisma/client";
import { AuthUtils } from "../../utils/auth.utils";

export class ReferralService {
  private authUtil: AuthUtils;
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
    this.authUtil = new AuthUtils();
  }

  async createUserReferral(name: string) {
    const limitUse = 3;
    let isUse = true;
    let randomNumber;
    let referralCode;

    // Geneate random number for the referral code
    do {
      randomNumber = Math.floor(Math.random() * 900) + 100;
      referralCode = `${name.substr(0, 3)}-${randomNumber}`;

      // check if referral already exist
      const checkUserReferral = await this.prisma.user_Referral.findUnique({
        where: {
          referral_code: referralCode,
        },
      });
      //     if its not available, isAvailable variable set
      if (!checkUserReferral) {
        isUse = false;
      }
    } while (isUse === true);

    // create referral code
    const createReferral = await this.prisma.user_Referral.create({
      data: {
        referral_code: referralCode,
        limit_use: limitUse,
        total_use: 0,
      },
    });
    return createReferral;
  }

  async useReferral(referral_code: string, token: string) {
    const useReferral = 20000;
    const ownedReferral = 35000;
    // Decode the token to get the user id
    // check if the token is valid
    const decodedToken = await this.authUtil.decodeToken(token);
    if (!decodedToken) {
      return { status: 401, message: "Invalid token" };
    }

    // Get the referral code from the referral table
    // Check the referral code is is valid or not
    const referral = await this.prisma.user_Referral.findUnique({
      where: {
        referral_code: referral_code,
      },
    });
    if (!referral) {
      return { status: 404, message: "Invalid referral code" };
      // Check the limit of the referral code
    } else if (referral.total_use === referral.limit_use) {
      return {
        status: 400,
        message: "Referral code has been used",
      };
    }

    // user of the owner of referral
    const referralOwner = await this.prisma.users.findFirst({
      where: {
        userReferralId: referral.user_referral_id,
      },
    });
    if (!referralOwner) {
      return { status: 404, message: "Referral owner not found" };
    }

    // User ID of the login user
    const { user_id } = decodedToken;
    const user = await this.prisma.users.findUnique({
      where: {
        user_id: user_id,
      },
    });

    if (!user) {
      return { status: 404, message: "User not found" };
    } else if (referral.user_referral_id === user.userReferralId) {
      return { status: 400, message: "You cannot use your own referral code" };
    } else if (user.referral_use) {
      return { status: 400, message: "You have already used a referral code" };
    }

    // Adding referral code to the login user
    const updatedUser = await this.prisma.users.update({
      where: {
        user_id: user_id,
      },
      data: {
        points: user.points + useReferral,
        referral_use: referral_code,
      },
    });

    // Update the total use of the referral code
    await this.prisma.user_Referral.update({
      where: {
        referral_code: referral_code,
      },
      data: {
        total_use: referral.total_use + 1,
      },
    });
    // Update the owner of the referral code
    await this.prisma.users.update({
      where: {
        user_id: referralOwner?.user_id,
      },
      data: {
        points: referralOwner?.points + ownedReferral,
      },
    });

    return {
      data: updatedUser,
      status: 200,
      message: "Referral code added successfully",
    };
  }
}
