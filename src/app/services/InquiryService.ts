import axios from "axios";
import { serverApi } from "../../lib/config";
import { Inquiry, InquiryInput } from "../../lib/types/inquiry";

/** Reception desk: questions to the library and the conversation that follows */
class InquiryService {
  private readonly path = serverApi;

  public async create(input: InquiryInput): Promise<{ inquiry: Inquiry; key: string }> {
    const result = await axios.post(`${this.path}/inquiry/create`, input, { withCredentials: true });
    return result.data;
  }

  public async getMine(): Promise<Inquiry[]> {
    const result = await axios.get(`${this.path}/inquiry/mine`, { withCredentials: true });
    return result.data;
  }

  public async getUnread(): Promise<number> {
    const result = await axios.get(`${this.path}/inquiry/unread`, { withCredentials: true });
    return Number(result.data?.unread) || 0;
  }

  /** Signed-in owner, or anyone with the private key from the link */
  public async getOne(id: string, key?: string): Promise<Inquiry> {
    const result = await axios.get(`${this.path}/inquiry/${encodeURIComponent(id)}`, { params: key ? { key } : {}, withCredentials: true });
    return result.data;
  }

  public async reply(id: string, message: string, key?: string): Promise<Inquiry> {
    const result = await axios.post(`${this.path}/inquiry/${encodeURIComponent(id)}/reply`, { message, key }, { withCredentials: true });
    return result.data;
  }
}

export default InquiryService;

/** Fired after a conversation with an unread reply was opened (the header recounts) */
export const INQUIRY_READ_EVENT = "bookon:inquiry-read";

/**
 * Guests have no account, so this browser remembers their conversation links.
 * Storage can be unavailable (private mode) — then it simply remembers nothing.
 */
const STORE = "bookon-inquiries";
export interface SavedInquiry {
  id: string;
  key: string;
  createdAt: string;
}

export const savedInquiries = (): SavedInquiry[] => {
  try {
    const list = JSON.parse(localStorage.getItem(STORE) || "[]");
    return Array.isArray(list) ? list.filter((x) => x && typeof x.id === "string" && typeof x.key === "string") : [];
  } catch {
    return [];
  }
};

export const rememberInquiry = (entry: SavedInquiry) => {
  try {
    const list = [entry, ...savedInquiries().filter((x) => x.id !== entry.id)].slice(0, 20);
    localStorage.setItem(STORE, JSON.stringify(list));
  } catch {
    /* not available */
  }
};

export const savedKeyFor = (id: string) => savedInquiries().find((x) => x.id === id)?.key;

export const threadLink = (id: string, key: string) => `${window.location.origin}/reception/${id}?key=${encodeURIComponent(key)}`;
