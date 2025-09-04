import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";

function Login() {
    const { login, token, ready } = useAuthStore();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (ready && token) return <Navigate to="/" replace />;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!email || !password) {
            toast.error("กรุณากรอกอีเมลและรหัสผ่าน");
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast.success("เข้าสู่ระบบสำเร็จ!");
            nav("/", { replace: true });
        } catch (e) {
            toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
        } finally {
            setLoading(false);
        }
    }

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
                <div className="bg-white rounded-xl shadow-lg border p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-2">Smart Cafe</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                อีเมล
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-colors text-sm sm:text-base"
                                placeholder="example@email.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-colors text-sm sm:text-base"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors text-sm sm:text-base"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    กำลังเข้าสู่ระบบ...
                                </div>
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ยังไม่มีบัญชี?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-black hover:underline"
                            >
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        to="/"
                        className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                        ← กลับหน้าแรก
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;