export interface UserProps {
  user_id: number;
  email: string;
  name: string;
  userReferralId: number;
  referral_use: string | null;
  password: string;
  points: number;
  user_role: string;
  access_token: string;
  created_at: Date;
  updated_at: Date;
}
export interface validateUserResponse {
  name: string;
  userReferralId: number;
  referral_use: string | null;
  points: number;
  user_role: string;
}

export interface AuthProps {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface TokenPayloadProps {
  user_id: number;
  email: string;
  user_role: string;
}
