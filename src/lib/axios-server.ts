// lib/axios-server.ts
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

// Create base axios instance
export const axiosServer = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_APP_URL}/api`,
  timeout: 10000,
});

// Create request interceptor to add auth token
axiosServer.interceptors.request.use(async (config) => {
  const { getToken } = await auth();
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
