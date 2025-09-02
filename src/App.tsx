import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import StatusOrder from "./pages/StatusOrder";


export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/status-order" element={<StatusOrder />} />
        {/* fallback ทุกเส้นทางที่ไม่ตรง */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
