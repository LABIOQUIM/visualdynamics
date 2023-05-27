import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "https://localhost:5000/api/v1"
      : "/server/api/v1"
});
