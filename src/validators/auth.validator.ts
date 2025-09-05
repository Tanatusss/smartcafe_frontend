import z from "zod";


export const signInSchema = z.object({
    email: z.email(),
    password: z.string().min(6,"รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
})

export type LoginValidator = z.infer<typeof signInSchema>;


export const signUpSchema = z
  .object({
    name: z.string().min(1, "กรุณากรอกชื่อ"),
    email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(6, "กรุณากรอกยืนยันรหัสผ่านอย่างน้อย 6 ตัวอักษร"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"], // ให้ error ไปโผล่ใต้ช่องยืนยันรหัสผ่าน
  });

export type SignUpValidator = z.infer<typeof signUpSchema>;