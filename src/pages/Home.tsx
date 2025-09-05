import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "../api/menuApi";
import type { MenuItemDTO } from "../api/menuApi";
import { createOrder, getOrderStatus } from "../api/orderApi";
import type { OrderItemReq } from "../api/orderApi";
import { fetchToppings, type ToppingDTO } from "../api/toppingApi";

//  ---------- utils ---------- 
const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const keyOf = (itemId: number, toppingIds: number[]) => {
  const sorted = [...toppingIds].sort((a, b) => a - b);
  return `${itemId}__${sorted.join("_")}`;
};

//  ---------- types ---------- 
type CartLine = {
  key: string;
  item_id: number;
  name: string;
  qty: number;
  toppingIds: number[];
  unitPrice: number;
  img?: string;
};

// สำหรับ Success Modal
type SuccessItem = {
  name: string;
  qty: number;
  toppings: string;
  lineTotal: number;
};

export default function Home() {
  // data state
  const [menu, setMenu] = useState<MenuItemDTO[]>([]);
  const [tops, setTops] = useState<ToppingDTO[]>([]);

  // ui/loading
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // cart
  const [cart, setCart] = useState<Record<string, CartLine>>({}); // key -> line

  // order/tracking
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [track, setTrack] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  // modal: picker
  const [pickItem, setPickItem] = useState<MenuItemDTO | null>(null);
  const [pickQty, setPickQty] = useState(1);
  const [pickTopIds, setPickTopIds] = useState<number[]>([]);

  // modal: success
  const [success, setSuccess] = useState<null | {
    orderId: number;
    items: SuccessItem[];
    total: number;
  }>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [m, t] = await Promise.all([fetchMenu(), fetchToppings()]);
        setMenu(m);
        setTops(t);
      } catch (error: any) {
        setErr(error?.message ?? "โหลดข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
   
  const toppingPriceById = useMemo(() => {
    const m = new Map<number, number>();
    for (const t of tops) m.set(t.id, t.price);
    return m;
  }, [tops]);

  const addToCart = (item: MenuItemDTO, qty: number, toppingIds: number[]) => {
    const tpSum = toppingIds.reduce((s, id) => s + (toppingPriceById.get(id) ?? 0), 0);
    const base = typeof item.price === "number" ? item.price : Number(item.price);
    const unitPrice = base + tpSum;

    const key = keyOf(item.item_id, toppingIds);
    setCart((c) => {
      const prev = c[key];
      const nextQty = (prev?.qty ?? 0) + qty;
      return {
        ...c,
        [key]: {
          key,
          item_id: item.item_id,
          name: item.name,
          qty: nextQty,
          toppingIds: toppingIds.slice(),
          unitPrice,
          img: item.img,
        },
      };
    });
  };

  const increase = (key: string) => setCart((value) => ({ ...value, [key]: { ...value[key], qty: value[key].qty + 1 } }));
  const decrease = (key: string) =>
    setCart((cart) => {
      const line = cart[key];
      if (!line) return cart;
      if (line.qty <= 1) {
        const { [key]: _, ...rest } = cart;
        return rest;
      }
      return { ...cart, [key]: { ...line, qty: line.qty - 1 } };
    });

  const clearCart = () => setCart({});

  const total = useMemo(
    () => Object.values(cart).reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
    [cart]
  );

  const openPicker = (item: MenuItemDTO) => {
    setPickItem(item);
    setPickQty(1);
    setPickTopIds([]);
  };
  const closePicker = () => setPickItem(null);

  const confirmPick = () => {
    if (!pickItem) return;
    addToCart(pickItem, pickQty, pickTopIds);
    closePicker();
  };

  const placeOrder = async () => {
    if (Object.keys(cart).length === 0) return;
    setPlacing(true);
    setErr(null);
    try {
     
      const cartLines = Object.values(cart);

      const itemsForReq: OrderItemReq[] = cartLines.map((line) => ({
        item_id: line.item_id,
        qty: line.qty,
        toppings: line.toppingIds,
      }));

      const linesForModal: SuccessItem[] = cartLines.map((line) => ({
        name: line.name,
        qty: line.qty,
        toppings:
          line.toppingIds.length > 0
            ? line.toppingIds.map((id) => tops.find((topping) => topping.id === id)?.name ?? String(id)).join(", ")
            : "ไม่มี",
        lineTotal: line.unitPrice * line.qty,
      }));

      const resp = await createOrder({ items: itemsForReq });

      // เก็บข้อมูลเพื่อแสดงใน success modal
      setSuccess({
        orderId: resp.order_id,
        items: linesForModal,
        total,
      });

      setOrderId(resp.order_id);
      clearCart();
      setStatus(null);
      setTrack(String(resp.order_id));
    } catch (error: any) {
      setErr(error?.response?.data?.message ?? error?.message ?? "สั่งซื้อไม่สำเร็จ");
    } finally {
      setPlacing(false);
    }
  };

  const checkStatus = async () => {
    const idNum = Number(track);
    if (!track || Number.isNaN(idNum)) return;
    setErr(null);
    try {
      const s = await getOrderStatus(idNum);
      const text = [
        `สถานะ: ${s.status}`,
        `ยอดรวม: ${formatTHB(s.total_price)}`,
        `สั่งเมื่อ: ${new Date(s.created_at).toLocaleString()}`,
        s.completed_at ? `เสร็จเมื่อ: ${new Date(s.completed_at).toLocaleString()}` : "",
      ]
        .filter(Boolean)
        .join(" • ");
      setStatus(text);
    } catch (error: any) {
      setStatus(null);
      setErr(error?.response?.data?.message ?? error?.message ?? "ดึงสถานะไม่สำเร็จ");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-3 md:ml-56">
      {/* header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 lg:col-span-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Smart Cafe</h1>
          <p className="text-sm text-gray-600">เลือกเมนู + ท็อปปิ้ง แล้วสั่งซื้อได้เลย</p>
        </div>
      </header>

      {loading && <div className="lg:col-span-3 text-center py-8">กำลังโหลดข้อมูล…</div>}
      {err && <div className="lg:col-span-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg">{err}</div>}

      {/* เมนู (ซ้าย) */}
      {!loading && !err && (
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {menu.map((menuItem) => (
              <div key={menuItem.item_id} className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <img src={menuItem.img} alt={menuItem.name} className="h-32 sm:h-40 w-full object-cover" />
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{menuItem.name}</h3>
                    <div className="font-medium text-sm sm:text-base whitespace-nowrap">{formatTHB(menuItem.price)}</div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      className="w-full sm:w-auto px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm transition-colors"
                      onClick={() => openPicker(menuItem)}
                    >
                      เลือกท็อปปิ้ง
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ตะกร้า (ขวา) */}
      <div className="rounded-xl border p-4 bg-white flex flex-col w-full shadow-sm sticky top-20 self-start">
        <div className="font-medium mb-3 text-base sm:text-lg">ตะกร้าของคุณ</div>
        {Object.keys(cart).length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">ยังไม่มีสินค้าในตะกร้า</div>
        ) : (
          <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
            {Object.values(cart).map((lineItem) => (
              <div
                key={lineItem.key}
                className="flex gap-3 p-2 border rounded-lg"
              >
                {/* ซ้าย: รูปสินค้า */}
                <img
                  src={lineItem.img}
                  alt=""
                  className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-md flex-shrink-0"
                />

                {/* กลาง: รายละเอียดสินค้า */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">{lineItem.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {lineItem.toppingIds.length > 0
                      ? `ท็อปปิ้ง: ${lineItem.toppingIds
                        .map((id) => tops.find((topping) => topping.id === id)?.name ?? id)
                        .join(", ")}`
                      : "ไม่มีท็อปปิ้ง"}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">
                    {formatTHB(lineItem.unitPrice)} × {lineItem.qty}
                  </div>
                </div>

                {/* ขวา: ปุ่มจำนวน + ราคา */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded border text-xs flex items-center justify-center hover:bg-gray-50"
                      onClick={() => decrease(lineItem.key)}
                    >
                      -
                    </button>
                    <span className="w-6 sm:w-8 text-center text-sm">{lineItem.qty}</span>
                    <button
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded border text-xs flex items-center justify-center hover:bg-gray-50"
                      onClick={() => increase(lineItem.key)}
                    >
                      +
                    </button>
                  </div>
                  <div className="font-semibold text-sm whitespace-nowrap">
                    {formatTHB(lineItem.unitPrice * lineItem.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* สรุปราคา + ปุ่มสั่งซื้ออยู่ท้ายตะกร้า */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center justify-between text-sm sm:text-base mb-3">
            <span className="text-gray-600">ยอดรวม</span>
            <span className="font-bold text-lg">{formatTHB(total)}</span>
          </div>
          <button
            className="w-full px-4 py-2.5 rounded-md bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-opacity"
            onClick={placeOrder}
            disabled={placing || total === 0}
          >
            {placing ? "กำลังสั่ง..." : "สั่งซื้อ"}
          </button>
        </div>
      </div>

      {/* ติดตามออร์เดอร์ (เต็มความกว้างด้านล่าง) */}
      <div id="order-tracking-section" className="rounded-xl border p-4 bg-white grid gap-3 lg:col-span-3 shadow-sm scroll-mt-20">
        {orderId && (
          <div className="rounded-lg border p-3 bg-green-50 text-sm">
            สั่งซื้อสำเร็จ! หมายเลขออร์เดอร์: <b>{orderId}</b>
          </div>
        )}
        <div className="font-medium">ติดตามสถานะออร์เดอร์</div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            placeholder="ใส่ Order ID"
            className="flex-1 sm:flex-none sm:w-48 border rounded-md px-3 py-2 text-sm"
          />
          <button 
            className="px-4 py-2 rounded-md border hover:bg-gray-50 text-sm transition-colors" 
            onClick={checkStatus}
          >
            เช็คสถานะ
          </button>
        </div>
        {status && <div className="text-sm text-gray-700 p-2 bg-gray-50 rounded">{status}</div>}
      </div>

      {/* Modal เลือกท็อปปิ้ง */}
      {pickItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-sm sm:text-base truncate mr-2">เลือกสำหรับ: {pickItem.name}</h3>
              <button onClick={closePicker} className="text-gray-500 hover:text-black p-1 flex-shrink-0">✕</button>
            </div>

            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-3">
                <div className="text-sm text-gray-600">ท็อปปิ้ง</div>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {tops.map((topping) => {
                    const checked = pickTopIds.includes(topping.id);
                    return (
                      <label key={topping.id} className="flex items-center justify-between border rounded-md px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                        <span className="flex-1 text-sm">{topping.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{formatTHB(topping.price)}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setPickTopIds((ids) =>
                                e.target.checked ? [...ids, topping.id] : ids.filter((x) => x !== topping.id)
                              )
                            }
                            className="h-4 w-4"
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm text-gray-600">จำนวน</span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-gray-50" 
                      onClick={() => setPickQty((quantity) => Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{pickQty}</span>
                    <button 
                      className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-gray-50" 
                      onClick={() => setPickQty((quantity) => quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex flex-col sm:flex-row justify-end gap-2">
              <button className="px-4 py-2 rounded-md border order-2 sm:order-1 hover:bg-gray-50" onClick={closePicker}>
                ยกเลิก
              </button>
              <button className="px-4 py-2 rounded-md bg-black text-white order-1 sm:order-2 hover:bg-gray-900" onClick={confirmPick}>
                ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal หลังสั่งซื้อ */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">สั่งซื้อสำเร็จ</div>
              <button
                className="text-gray-500 hover:text-black p-1"
                onClick={() => setSuccess(null)}
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="p-4 flex-1 overflow-auto">
              <div className="space-y-4">
                <div className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                  หมายเลขออเดอร์: <b>{success.orderId}</b>
                </div>

                <div className="space-y-3">
                  {success.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between gap-3 py-2 border-b last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{it.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 break-words">ท็อปปิ้ง: {it.toppings}</div>
                        <div className="text-xs text-gray-500">จำนวน: {it.qty}</div>
                      </div>
                      <div className="text-right font-semibold text-sm whitespace-nowrap">
                        {formatTHB(it.lineTotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-gray-600 font-medium">ยอดรวม</span>
                  <span className="font-bold text-lg">{formatTHB(success.total)}</span>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="p-4 border-t">
              <button
                className="w-full px-4 py-2 rounded-md bg-black text-white hover:bg-gray-900"
                onClick={() => setSuccess(null)}
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