/**
 * API base URL:
 * 1. REACT_APP_API_URL if set at build time
 * 2. localhost dev -> backend dev server on :3003 (npm run start:dev)
 * 3. production -> same origin (nginx proxies /member, /product, /order, /uploads)
 */
const resolveServerApi = (): string => {
  const envApi = process.env.REACT_APP_API_URL?.replace(/\/+$/, "");
  if (envApi) return envApi;

  if (typeof window === "undefined") return "";

  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocalHost) return `${protocol}//${hostname}:3003`;

  return window.location.origin;
};

export const serverApi: string = resolveServerApi();

export const Messages = {
    error1: "Something went wrong!",
    error2: "Please login first!",
    error3: "Please fulfill all inputs!",
    error4: "Message is empty",
    error5: "Only images with jpeg, jpg, png, webp format allowed!",
    error11: "Image must be smaller than 5MB!",
    error6: "Username must be at least 3 characters long!",
    error7: "Username can only contain letters, numbers, and underscores!",
    error8: "Phone number must contain only digits!",
    error9: "Phone number must be at least 9 digits long!",
    error10: "Password must be at least 6 characters long!",
};
