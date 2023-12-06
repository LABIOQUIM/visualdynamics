import axios from "axios";

export const serverApi = axios.create({
  baseURL: `http://server:3002/api/v1`
});

export const mailerApi = axios.create({
  baseURL: `http://mailer:3000`
});
