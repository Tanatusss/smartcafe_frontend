// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllOrders,
  markOrderReady,
  type AllOrdersResp,
} from "../api/orderApi";

export default function Dashboard() {
  const [orders, setOrders] = useState<AllOrdersResp[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("โหลดรายการออร์เดอร์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReady = async (order: AllOrdersResp) => {
    if (["ready", "completed", "canceled"].includes(order.status)) return;
    try {
      setBusy(order.order_id);
      const updated = await markOrderReady(order.order_id);
      setOrders((prev) =>
        prev.map((x) =>
          x.order_id === order.order_id
            ? { ...x, status: updated.status, completed_at: updated.completed_at }
            : x
        )
      );
      toast.success(`ออร์เดอร์ #${order.order_id} เปลี่ยนเป็น READY`);
    } catch (error) {
      console.error(error);
      toast.error("อัปเดตไม่สำเร็จ");
    } finally {
      setBusy(null);
    }
  };

  const statusClass = (s: AllOrdersResp["status"]) =>
    s === "ready"
      ? "bg-green-100 text-green-700"
      : s === "completed"
        ? "bg-blue-100 text-blue-700"
        : s === "canceled"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700";

  return (
    // ชดเชยพื้นที่ Sidebar บนจอ md+
    <div className="px-4 py-6 md:ml-56">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">รายการออร์เดอร์ทั้งหมด</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="w-full sm:w-auto rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          รีเฟรช
        </button>
      </div>

      {/* Mobile & Tablet view: Card list */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="rounded-xl border bg-white p-4 text-center text-gray-500">
            กำลังโหลด...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-center text-gray-500">
            ยังไม่มีออร์เดอร์
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.order_id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-lg">#{o.order_id}</div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                    o.status
                  )}`}
                >
                  {o.status}
                </span>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mb-3">
                {new Date(o.created_at).toLocaleString("th-TH")}
              </div>

              <div className="space-y-1.5 text-sm mb-4">
                {o.items.length ? (
                  o.items.map((it, idx) => (
                    <div key={`${o.order_id}-${idx}`} className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{it.menu_name ?? "Item"}</span>
                        <span className="text-gray-600"> × {it.qty}</span>
                        {it.toppings.length ? (
                          <div className="text-xs text-gray-500 mt-0.5 break-words">
                            + {it.toppings.join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
                <div className="text-sm sm:text-base font-medium">
                  รวม: <span className="text-lg">{o.total_price} บาท</span>
                </div>
                <button
                  disabled={
                    ["ready", "completed", "canceled"].includes(o.status) ||
                    busy === o.order_id
                  }
                  onClick={() => handleReady(o)}
                  className={[
                    "w-full sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    ["ready", "completed", "canceled"].includes(o.status)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-900",
                  ].join(" ")}
                >
                  {busy === o.order_id ? "กำลังอัปเดต..." : "เสร็จแล้ว"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden lg:block rounded-xl border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]"> 
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium min-w-[80px]">Order</th>
                <th className="px-4 py-3 font-medium min-w-[140px]">Created</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Items</th>
                <th className="px-4 py-3 font-medium min-w-[80px]">Total</th>
                <th className="px-4 py-3 font-medium min-w-[80px]">Status</th>
                <th className="px-4 py-3 font-medium text-right min-w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                      กำลังโหลด...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีออร์เดอร์
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.order_id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium">#{o.order_id}</td>
                    <td className="px-4 py-4 text-sm">
                      {new Date(o.created_at).toLocaleString("th-TH")}
                    </td>
                    <td className="px-4 py-4">
                      {o.items.length ? (
                        <div className="space-y-1 max-w-xs">
                          {o.items.map((it, idx) => (
                            <div key={`${o.order_id}-${idx}`} className="text-sm">
                              <span className="font-medium">{it.menu_name ?? "Item"}</span>
                              <span className="text-gray-600"> × {it.qty}</span>
                              {it.toppings.length ? (
                                <div className="text-xs text-gray-500 break-words">
                                  + {it.toppings.join(", ")}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium">{o.total_price} บาท</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                          o.status
                        )}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        disabled={
                          ["ready", "completed", "canceled"].includes(o.status) ||
                          busy === o.order_id
                        }
                        onClick={() => handleReady(o)}
                        className={[
                          "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                          ["ready", "completed", "canceled"].includes(o.status)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-900",
                        ].join(" ")}
                      >
                        {busy === o.order_id ? "กำลังอัปเดต..." : "เสร็จแล้ว"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}