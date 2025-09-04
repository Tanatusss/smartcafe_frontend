import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import StatusOrder from "./pages/StatusOrder";
import Login from "./pages/login";
import Register from "./pages/register";
import RequireRole from "./components/RequireRole";


export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/status-order" element={<StatusOrder />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* protect เฉพาะ role BARISTA */}
        <Route element={<RequireRole role="BARISTA" />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        {/* fallback ทุกเส้นทางที่ไม่ตรง */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
