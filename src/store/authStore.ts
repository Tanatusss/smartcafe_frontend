import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { loginApi, registerApi } from "../api/authApi";
import { jwtDecode } from "jwt-decode";

export type User = { id: number; name: string; email: string; role: "USER" | "BARISTA" } | null;

type Payload = {
  id: number;
  email: string;
  name?: string;
  role: "USER" | "BARISTA" ;
  exp?: number;
  iat?: number;
};

type AuthState = {
  user: User | null;
  token: string | null;
  expiresIn?: string | number | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setReady: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresIn: null,
      ready: false,

      setReady: (v) => set({ ready: v }),

       async login(email, password) {
        const { token, expiresIn, user: apiUser } = await loginApi(email, password);

        // ถ้า backend ไม่ส่ง user → decode token สร้าง user เอง
        let user = apiUser;
        if (!user && token) {
          try {
            const p = jwtDecode<Payload>(token);
            user = {
              id: p.id,
              email: p.email,
              name: p.name ?? p.email, 
              role: p.role,
            };
          } catch {
            user = null;
          }
        }

        set({
          token: token ?? null,
          expiresIn: (expiresIn as any) ?? null,
          user: user ?? null,
        });
      },


      async register(name, email, password) {
        // backend ส่งแค่ message
        await registerApi({ name, email, password });
        // ทางเลือก:
        // 1) ให้ผู้ใช้ไป login เอง (แนะนำตอนนี้)
        // 2) ถ้าอยาก auto-login และมี password อยู่ในฟอร์ม: await useAuthStore.getState().login(email, password);
      },

      logout() {
        set({ token: null, user: null, expiresIn: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.setReady(true),
      partialize: (s) => ({ user: s.user, token: s.token, expiresIn: s.expiresIn }),
    }
  )
);

