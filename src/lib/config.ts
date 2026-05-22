
const resolveServerApi = (): string => {
  const envApi = process.env.REACT_APP_API_URL;

  if (typeof window === "undefined") {
    return envApi || "";
  }

  const { protocol, hostname } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

  // Local browser access should hit local backend directly.
  // This avoids NAT loopback/public IP timeout during local testing.
  if (isLocalHost) {
    return `${protocol}//${hostname}:3005`;
  }

  return envApi || window.location.origin;
};

export const serverApi: string = resolveServerApi();

export const Messages = {
    error1: "Something went wrong!",
    error2: "Please login first!",
    error3: "Please fulfill all inputs!",
    error4: "Message is empty",
    error5: "Only images with jpeg, jpg, png format allowed!",
    error6: "Username must be at least 3 characters long!",
    error7: "Username can only contain letters, numbers, and underscores!",
    error8: "Phone number must contain only digits!",
    error9: "Phone number must be at least 9 digits long!",
    error10: "Password must be at least 6 characters long!",
};