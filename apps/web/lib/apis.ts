import axios from "axios";

export const apiQSAR = axios.create({
  baseURL: "http://api-qsar:3000/v1",
});
