export type InquiryTopic = "ORDER" | "BOOK" | "DELIVERY" | "ACCOUNT" | "OTHER";
export type InquiryStatus = "NEW" | "ANSWERED" | "CLOSED";

export const INQUIRY_TOPICS: InquiryTopic[] = ["ORDER", "BOOK", "DELIVERY", "ACCOUNT", "OTHER"];
export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 2000;

export interface InquiryMessage {
  _id: string;
  messageFrom: "READER" | "LIBRARY";
  messageText: string;
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  inquiryName: string;
  inquiryEmail?: string;
  inquiryTopic: InquiryTopic;
  inquiryOrder?: string;
  inquiryStatus: InquiryStatus;
  inquiryReaderUnread: boolean;
  inquiryMessages: InquiryMessage[];
  lastMessageAt: string;
  createdAt: string;
}

export interface InquiryInput {
  name?: string;
  email?: string;
  phone?: string;
  topic: InquiryTopic;
  orderId?: string;
  message: string;
  lang: string;
  /** honeypot, always empty for people */
  website?: string;
}
