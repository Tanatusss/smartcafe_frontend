import { useEffect, useRef, useState } from "react";
import { getOrderDetail, type OrderDetailResp } from "../api/orderApi";

//แปลงตัวเลขเป็นเงินไทยแบบไม่มีทศนิยม
const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

// สี badge ตามสถานะ (ใช้ตัวพิมพ์เล็กตาม backend: pending/preparing/ready/completed/canceled)
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
    case "รอดำเนินการ":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "preparing":
    case "กำลังเตรียม":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ready":
    case "พร้อม":
      return "bg-green-100 text-green-800 border-green-200";
    case "completed":
    case "เสร็จสิ้น":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "canceled": 
    case "ยกเลิก":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function StatusOrder() {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState<OrderDetailResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ปิดด้วย ESC
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

   //useRef: เปลี่ยนค่าได้โดยไม่ทำให้ component re-render กันปุ่มกดซ้ำๆ 
  const lockRef = useRef(false);

  //fetchข้อมูลมาจาก API
  const checkStatus = async () => {
    const idNum = Number(orderId);
    if (!orderId || Number.isNaN(idNum) || idNum <= 0) {
      setError("กรุณาใส่หมายเลขออร์เดอร์ที่ถูกต้อง");
      return;
    }
    // กันยิงapiซ้ำๆ
    if (lockRef.current) return;
    lockRef.current = true;

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const data = await getOrderDetail(idNum); 
      setOrderData(data);
      setShowModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "ไม่พบข้อมูลออร์เดอร์");
      setOrderData(null);
    } finally {
      setLoading(false);
      lockRef.current = false;
    }
  };

  // กด Enter เพื่อเช็คสถานะได้
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      checkStatus();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderData(null);
  };

  const statusStr = orderData?.status?.toLowerCase() ?? "";
  const stepPreparingDone = ["preparing", "ready", "completed"].includes(statusStr);
  const stepReadyDone = ["ready", "completed"].includes(statusStr);
  const stepCompletedDone = ["completed"].includes(statusStr);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 md:ml-56">
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ติดตามสถานะออเดอร์</h1>
          <p className="text-sm sm:text-base text-gray-600">ใส่หมายเลขออเดอร์เพื่อตรวจสอบสถานะ</p>
        </header>

        {/* Search Section */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                หมายเลขออเดอร์
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="orderId"
                  type="text"
                  inputMode="numeric"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.trim())} 
                  onKeyDown={handleKeyPress}
                  placeholder="กรุณาใส่หมายเลขออร์เดอร์"
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-colors text-sm sm:text-base disabled:bg-gray-50"
                />
                <button
                  onClick={checkStatus}
                  disabled={loading || !orderId}
                  className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors font-medium text-sm sm:text-base"
                >
                  {loading ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะ"}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">วิธีใช้งาน</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• ใส่หมายเลขออเดอร์ที่ได้รับหลังจากสั่งซื้อ</li>
            <li>• กดปุ่ม "ตรวจสอบสถานะ" หรือกด Enter</li>
            <li>• ระบบจะแสดงรายละเอียดและสถานะปัจจุบันของออเดอร์</li>
          </ul>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && orderData && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.currentTarget === e.target && closeModal()}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">ออเดอร์ #{orderId}</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(orderData.status)}`}>
                  {orderData.status}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black p-1"
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Order Info */}
              <div>
                <p className="text-sm text-gray-600">
                  สั่งเมื่อ: {new Date(orderData.created_at).toLocaleString("th-TH")}
                </p>
                {orderData.completed_at && (
                  <p className="text-sm text-green-600 mt-1">
                    เสร็จสิ้นเมื่อ: {new Date(orderData.completed_at).toLocaleString("th-TH")}
                  </p>
                )}
              </div>

              {/* Order Items (ของจริง) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">รายการที่สั่ง</h3>
                {orderData.items?.length ? (
                  <div className="space-y-3">
                    {orderData.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {it.menu_name ?? (it.item_id ? `รหัสสินค้า #${it.item_id}` : "รายการ")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {it.toppings?.length ? `ท็อปปิ้ง: ${it.toppings.join(", ")}` : "ไม่มีท็อปปิ้ง"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {it.unit_price != null ? `${formatTHB(it.unit_price)} × ${it.qty}` : `จำนวน ${it.qty} ชิ้น`}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {it.total_price_item != null
                            ? formatTHB(it.total_price_item)
                            : it.unit_price != null
                            ? formatTHB(it.unit_price * it.qty)
                            : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">ไม่มีรายการสินค้า</p>
                )}
              </div>

              {/* Total */}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">ยอดรวมทั้งหมด</h3>
                  <p className="text-xl font-bold text-gray-900">{formatTHB(orderData.total_price)}</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">สถานะออเดอร์</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm text-gray-700">รับออเดอร์แล้ว</span>
                      <span className="text-xs text-gray-500">
                        {new Date(orderData.created_at).toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stepPreparingDone ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700">กำลังเตรียม</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stepReadyDone ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-700">พร้อมรับ</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stepCompletedDone ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm text-gray-700">เสร็จสิ้น</span>
                      {orderData.completed_at && (
                        <span className="text-xs text-gray-500">
                          {new Date(orderData.completed_at).toLocaleString("th-TH")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
