import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { apiMessage } from "../i18n";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

const app = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

app.interceptors.request.use(
  (res) => res,
  (err) => Promise.reject(err)
);

// Every toast reads `message`, so translate it here once: success payloads and error bodies.
const localize = (body?: { code?: string; message?: string }) => {
  if (body?.message) body.message = apiMessage(body);
};

app.interceptors.response.use(
  (res) => {
    localize(res.data?.data);
    return res;
  },
  async (err: AxiosError<{ code?: string; message?: string }>) => {
    const originalConfig = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (err.response?.status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const { data } = await axios.get(`${BASE_URL}/user/refresh-token`, {
          withCredentials: true,
        });

        // refresh-token answers { statusCode, data: { user } }; replay only when it found the user
        if (data?.data?.user) return app(originalConfig);
      } catch (error) {
        localize((error as AxiosError<{ code?: string; message?: string }>).response?.data);
        return Promise.reject(error);
      }
    }
    localize(err.response?.data);
    return Promise.reject(err);
  }
);

const http = {
  get: app.get,
  post: app.post,
  delete: app.delete,
  put: app.put,
  patch: app.patch,
};

export default http;
