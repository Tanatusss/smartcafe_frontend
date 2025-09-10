import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { signUpSchema } from "../validators/auth.validator";

type FieldErrors = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

function Register() {
    const { register, token, ready } = useAuthStore();
    const nav = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // เก็บ error ราย field หลัง validate ด้วย zod
    const [errors, setErrors] = useState<FieldErrors>({});

    // ถ้า rehydrate storage เสร็จ (ready) และมี token แล้ว → redirect ออกไปหน้าแรก
    if (ready && token) return <Navigate to="/" replace />;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();

        // validate ด้วย zod
        const result = signUpSchema.safeParse({ name, email, password, confirmPassword });
        if (!result.success) {
            const { fieldErrors } = result.error.flatten(
                (issue) => issue.message //Zod รุ่นใหม่ (v3.23+) บังคับว่าห้ามว่าง
            );
            setErrors({
                name: fieldErrors.name?.[0],
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
                confirmPassword: fieldErrors.confirmPassword?.[0],
            });
            return;
        }
        setErrors({}); // ล้าง error


        setLoading(true);
        try {
            await register(name, email, password, confirmPassword);
            toast.success("สมัครสมาชิกสำเร็จ!");
            nav("/login", { replace: true });
        } catch (e) {
            toast.error("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่");
        } finally {
            setLoading(false);
        }
    }


    // ระหว่างที่ยัง rehydrate store ไม่เสร็จ แสดง loading (กัน UI กระพริบ)
    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-sky-200/50 p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">

                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
                            สมัครสมาชิก
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 mt-2">Smart Cafe</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                ชื่อ
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setErrors((prev) => ({ ...prev, name: undefined }));
                                }}
                                className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all duration-200 text-sm sm:text-base bg-white/50 backdrop-blur-sm ${errors.name ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                                    }`}
                                placeholder="ชื่อของคุณ"
                                autoComplete="name"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                อีเมล
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    setErrors((prev) => ({ ...prev, email: undefined }));
                                }}
                                className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none transition-all duration-200 text-sm sm:text-base bg-white/50 backdrop-blur-sm 
                                    ${errors.email ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                                    }`}
                                placeholder="example@email.com"
                                autoComplete="email"
                                required
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors((prev) => ({ ...prev, password: undefined, confirmPassword: undefined }));
                                    }}
                                    className={`w-full px-3 py-2.5 pr-10 border rounded-xl focus:ring-2 outline-none transition-all duration-200 text-sm sm:text-base bg-white/50 backdrop-blur-sm ${errors.password ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                                        }`}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                ยืนยันรหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                    }}
                                    className={`w-full px-3 py-2.5 pr-10 border rounded-xl focus:ring-2 outline-none transition-all duration-200 text-sm sm:text-base bg-white/50 backdrop-blur-sm ${errors.confirmPassword ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-sky-200 focus:ring-sky-400 focus:border-sky-400"
                                        }`}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !name || !email || !password || !confirmPassword}
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    กำลังสมัครสมาชิก...
                                </div>
                            ) : (
                                "สมัครสมาชิก"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            มีบัญชีอยู่แล้ว?{" "}
                            <Link
                                to="/login"
                                className="font-medium bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent hover:from-sky-700 hover:to-blue-700 transition-all duration-200"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-sky-700 transition-colors duration-200 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-sky-200/50 hover:bg-white/70"
                    >
                        กลับหน้าแรก
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;