import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { loginApi, registerApi } from "../api/authApi";
import { jwtDecode } from "jwt-decode";


//zustand เก็บglobal state , persist เก็บข้อมูลใน localStorage

//รูปแบบข้อมูลผู้ใช้ที่เก็บใน store
export type User = { id: number; name: string; email: string; role: "USER" | "BARISTA" } | null;


// รูปแบบ payload ที่ต้องการใน JWT
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

// สร้าง Zustand store + persist ลง localStorage
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
        await registerApi({ name, email, password, confirmPassword: password });
      },
      
      //ออกจากระบบ → เคลียร์ token/user/expiresIn ออกจาก store
      logout() {
        set({ token: null, user: null, expiresIn: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage), //ใช้ localStorage เป็นตัว persist
      // โหลดข้อมูลจาก storage เสร็จแล้วตั้ง ready = true กันuiกระพริบ
      onRehydrateStorage: () => (state) => state?.setReady(true),
      // partialize: ระบุว่าให้ persist เฉพาะฟิลด์ไหน (กันการเก็บค่าที่ไม่จำเป็น)
      partialize: (s) => ({ user: s.user, token: s.token, expiresIn: s.expiresIn }),
    }
  )
);

