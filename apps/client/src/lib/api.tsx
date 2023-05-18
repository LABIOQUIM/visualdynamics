import axios from "axios";

export const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? "http://server:3002/api/v1"
      : "http://localhost:3002/api/v1"
});
