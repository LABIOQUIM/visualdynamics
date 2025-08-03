import axios from "axios";

export const api = axios.create({
  baseURL: "http://api:3000/v1",
});
