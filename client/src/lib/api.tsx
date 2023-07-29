import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:3002/api/v1"
      : "https://visualdynamics.fiocruz.br/server/api/v1"
});
