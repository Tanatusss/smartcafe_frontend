import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi, registerApi } from "../api/authApi";

export type User = { id: number; name: string; email: string } | null;

type AuthState = {
  user: User;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setReady: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      ready: false,

      setReady: (v) => set({ ready: v }),

      async login(email, password) {
        const { token, user } = await loginApi(email, password);
        set({ token, user });
      },

      async register(name, email, password, confirmPassword) {
        const { token, user } = await registerApi({ name, email, password, confirmPassword });
        set({ token, user });
      },

      logout() {
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth",
      onRehydrateStorage: () => (state) => state?.setReady(true),
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
