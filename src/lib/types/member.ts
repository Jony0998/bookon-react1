import { MemberStatus, MemberType } from "../enums/member.enum";

export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone?: string;
  memberEmail?: string;
  memberEmailVerified?: boolean;
  memberPassword?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupInput {
  memberNick: string;
  memberEmail: string;
  memberPassword: string;
}

/** `login` is an email address or a username */
export interface LoginInput {
  login: string;
  memberPassword: string;
}

export interface MemberUpdateInput {
  memberNick?: string;
  memberPhone?: string;
  memberEmail?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string | File;
}
