import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

type Props = {
  role: string; // เช่น "BARISTA" || "USER""
};

export default function RequireRole({ role }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />; // redirect กลับหน้าแรก
  }

  return <Outlet />;
}
