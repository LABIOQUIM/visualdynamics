import axios from "axios";

export const api = axios.create({
  baseURL: `http://157.86.210.81:5000/api/v1`
  // baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`
});
