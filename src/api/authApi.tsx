import { api } from "./axiosConfig";



export type UserDTO = {
  id: number;
  name: string;
  email: string;
};

export type LoginResponse =
  | { token: string; user: UserDTO }                 
  | { data: { token: string; user: UserDTO } };     

export async function loginApi(email: string, password: string) {
  const res = await api.post<LoginResponse>("/authen", { email, password });
  // รองรับทั้งสองรูปแบบ
  const payload = "data" in res.data ? res.data.data : res.data;
  return { token: payload.token, user: payload.user };
}

export type RegisterBody = { name: string; email: string; password: string; confirmPassword: string };
export type RegisterResponse =
  | { token: string; user: UserDTO }
  | { data: { token: string; user: UserDTO } };

export async function registerApi(body: RegisterBody) {
  const res = await api.post<RegisterResponse>("/register", body);
  const payload = "data" in res.data ? res.data.data : res.data;
  return { token: payload.token, user: payload.user };
}
