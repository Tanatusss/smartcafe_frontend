import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import StatusOrder from "./pages/StatusOrder";
import Login from "./pages/login";
import Register from "./pages/register";


export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/status-order" element={<StatusOrder />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
    
        {/* fallback ทุกเส้นทางที่ไม่ตรง */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
