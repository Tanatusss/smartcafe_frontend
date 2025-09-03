import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";





function Login() {
    const { login, token, ready } = useAuthStore();
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (ready && token) return <Navigate to="/" replace />;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password.");
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            toast.success("Login successful!");
            nav("/", { replace: true });
        } catch (e) {
            // ถ้ามี helper แยก error จาก backend ให้ใช้ได้: toast.error(getApiErrorMessage(e, "Invalid credentials."));
            toast.error("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!ready) return null;

    return (
        <div>
            <h1 className="text-2xl font-semibold">Login</h1>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <div>
                    <label className="block text-sm">Email</label>
                    <input className="border rounded px-3 py-2 w-full"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm">Password</label>
                    <input className="border rounded px-3 py-2 w-full" type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <button
                    className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    )
}

export default Login