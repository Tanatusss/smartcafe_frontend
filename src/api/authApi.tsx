import { api } from "./axiosConfig";

export type UserDTO = { id: number; name: string; email: string; role: "USER" | "BARISTA" };

type LoginResp = {
  token: string;
  expires_in: string | number;
  user?: UserDTO;
};

export async function loginApi(email: string, password: string) {
  const res = await api.post<LoginResp>("/authen", { email, password });
  return {
    token: res.data.token,
    expiresIn: res.data.expires_in,
    user: res.data.user ?? null,
  };
}


type RegisterBody = { name: string; email: string; password: string };
type RegisterResp = { message: string };

export async function registerApi(body: RegisterBody) {
  const res = await api.post<RegisterResp>("/register", body);
  return res.data; 
}
