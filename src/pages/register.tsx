import { Navigate, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";


function Register() {
    const { register, token, ready } = useAuthStore()
    const nav = useNavigate()

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (ready && token) return <Navigate to="/" replace />;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password and confirm password do not match.");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, confirmPassword);
            toast.success("Registration successful!");
            nav("/login", { replace: true });
        } catch (e) {
            toast.error("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!ready) return null;


    return (
        <div>
            <h1 className="text-2xl font-semibold">Register</h1>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
                <div>
                    <label className="block text-sm">Name</label>
                    <input className="border rounded px-3 py-2 w-full"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm">Email</label>
                    <input className="border rounded px-3 py-2 w-full" type="email"
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
                <div>
                    <label className="block text-sm">Confirm Password</label>
                    <input className="border rounded px-3 py-2 w-full" type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    )
}

export default Register