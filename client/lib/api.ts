import axios from "axios";

export const api = axios.create({
  baseURL: `/server/api/v1`
});

export const serverApi = axios.create({
  baseURL: `http://server:3002/server/api/v1`
});

export const mailerApi = axios.create({
  baseURL: `http://mailer:3000`
});
