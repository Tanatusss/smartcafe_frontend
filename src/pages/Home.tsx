import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "../api/menuApi";
import type { MenuItemDTO } from "../api/menuApi";
import { createOrder, getOrderStatus } from "../api/orderApi";
import type { OrderItemReq } from "../api/orderApi";
import { fetchToppings, type ToppingDTO } from "../api/toppingApi";

/** ---------- utils ---------- */
const formatTHB = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const keyOf = (itemId: number, toppingIds: number[]) => {
  const sorted = [...toppingIds].sort((a, b) => a - b);
  return `${itemId}__${sorted.join("_")}`;
};

/** ---------- types (local UI) ---------- */
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
      } catch (e: any) {
        setErr(e?.message ?? "โหลดข้อมูลล้มเหลว");
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

  const inc = (k: string) => setCart((c) => ({ ...c, [k]: { ...c[k], qty: c[k].qty + 1 } }));
  const dec = (k: string) =>
    setCart((c) => {
      const line = c[k];
      if (!line) return c;
      if (line.qty <= 1) {
        const { [k]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [k]: { ...line, qty: line.qty - 1 } };
    });

  const clearCart = () => setCart({});

  const total = useMemo(
    () => Object.values(cart).reduce((s, l) => s + l.unitPrice * l.qty, 0),
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
      // snapshot cart สำหรับ modal
      const cartLines = Object.values(cart);

      const itemsForReq: OrderItemReq[] = cartLines.map((l) => ({
        item_id: l.item_id,
        qty: l.qty,
        toppings: l.toppingIds,
      }));

      const linesForModal: SuccessItem[] = cartLines.map((l) => ({
        name: l.name,
        qty: l.qty,
        toppings:
          l.toppingIds.length > 0
            ? l.toppingIds.map((id) => tops.find((t) => t.id === id)?.name ?? String(id)).join(", ")
            : "ไม่มี",
        lineTotal: l.unitPrice * l.qty,
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
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "สั่งซื้อไม่สำเร็จ");
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
    } catch (e: any) {
      setStatus(null);
      setErr(e?.response?.data?.message ?? e?.message ?? "ดึงสถานะไม่สำเร็จ");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-3">
      {/* header */}
      <header className="flex items-end justify-between gap-4 lg:col-span-3">
        <div>
          <h1 className="text-2xl font-bold">Smart Cafe</h1>
          <p className="text-sm text-gray-600">เลือกเมนู + ท็อปปิ้ง แล้วสั่งซื้อได้เลย</p>
        </div>
      </header>

      {loading && <div className="lg:col-span-3">กำลังโหลดข้อมูล…</div>}
      {err && <div className="lg:col-span-3 text-red-600 text-sm">{err}</div>}

      {/* เมนู (ซ้าย) */}
      {!loading && !err && (
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {menu.map((m) => (
              <article key={m.item_id} className="border rounded-xl overflow-hidden bg-white">
                <img src={m.img} alt={m.name} className="h-40 w-full object-cover" />
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{m.name}</h3>
                    <div className="font-medium">{formatTHB(m.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="ml-auto px-3 py-1.5 rounded-md border hover:bg-gray-50"
                      onClick={() => openPicker(m)}
                    >
                      เลือกท็อปปิ้ง
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ตะกร้า (ขวา) */}
      <div className="rounded-xl border p-3 bg-white flex flex-col w-full sm:w-80 md:w-96 lg:w-[340px]">
        <div className="font-medium mb-2">ตะกร้าของคุณ</div>
        {Object.keys(cart).length === 0 ? (
          <div className="text-sm text-gray-500">ยังไม่มีสินค้าในตะกร้า</div>
        ) : (
          <ul className="divide-y">
            {Object.values(cart).map((l) => (
              <li
                key={l.key}
                className="grid grid-cols-[3rem,1fr,auto] gap-3 py-2 items-center"
              >
                {/* ซ้าย: รูปสินค้า */}
                <img
                  src={l.img}
                  alt=""
                  className="h-12 w-12 object-cover rounded-md"
                />

                {/* กลาง: รายละเอียดสินค้า */}
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.name}</div>
                  <div className="text-xs text-gray-500">
                    {l.toppingIds.length > 0
                      ? `ท็อปปิ้ง: ${l.toppingIds
                        .map((id) => tops.find((t) => t.id === id)?.name ?? id)
                        .join(", ")}`
                      : "ไม่มีท็อปปิ้ง"}
                  </div>
                </div>

                {/* ขวา: ปุ่มจำนวน + ราคา */}
                <div className="flex items-center gap-2 justify-self-end">
                  <button
                    className="h-8 w-8 rounded-md border"
                    onClick={() => dec(l.key)}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{l.qty}</span>
                  <button
                    className="h-8 w-8 rounded-md border"
                    onClick={() => inc(l.key)}
                  >
                    +
                  </button>
                  <span className="font-semibold whitespace-nowrap">
                    {formatTHB(l.unitPrice * l.qty)}
                  </span>
                </div>
              </li>

            ))}
          </ul>
        )}

        {/* สรุปราคา + ปุ่มสั่งซื้ออยู่ท้ายตะกร้า */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">ยอดรวม</span>
          <span className="font-semibold">{formatTHB(total)}</span>
        </div>
        <button
          className="mt-3 px-3 py-2 rounded-md bg-black text-white disabled:opacity-50"
          onClick={placeOrder}
          disabled={placing || total === 0}
        >
          {placing ? "กำลังสั่ง..." : "สั่งซื้อ"}
        </button>
      </div>

      {/* ติดตามออร์เดอร์ (เต็มความกว้างด้านล่าง) */}
      <div className="rounded-xl border p-3 bg-white grid gap-2 lg:col-span-3">
        {orderId && (
          <div className="rounded-lg border p-2 bg-green-50 text-sm">
            สั่งซื้อสำเร็จ! หมายเลขออร์เดอร์: <b>{orderId}</b>
          </div>
        )}
        <div className="font-medium">ติดตามสถานะออร์เดอร์</div>
        <div className="flex gap-2">
          <input
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            placeholder="ใส่ Order ID"
            className="border rounded-md px-3 py-1.5 w-48"
          />
          <button className="px-3 py-1.5 rounded-md border hover:bg-gray-50" onClick={checkStatus}>
            เช็คสถานะ
          </button>
        </div>
        {status && <div className="text-sm text-gray-700">{status}</div>}
      </div>

      {/* Modal เลือกท็อปปิ้ง */}
      {pickItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">เลือกสำหรับ: {pickItem.name}</h3>
              <button onClick={closePicker} className="text-gray-500 hover:text-black">✕</button>
            </div>

            <div className="space-y-2 max-h-64 overflow-auto">
              <div className="text-sm text-gray-600">ท็อปปิ้ง</div>
              <ul className="grid gap-2">
                {tops.map((t) => {
                  const checked = pickTopIds.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                      <span>{t.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{formatTHB(t.price)}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setPickTopIds((ids) =>
                              e.target.checked ? [...ids, t.id] : ids.filter((x) => x !== t.id)
                            )
                          }
                        />
                      </div>
                    </label>
                  );
                })}
              </ul>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-gray-600">จำนวน</span>
                <button className="h-8 w-8 rounded-md border" onClick={() => setPickQty((q) => Math.max(1, q - 1))}>
                  -
                </button>
                <span className="w-8 text-center">{pickQty}</span>
                <button className="h-8 w-8 rounded-md border" onClick={() => setPickQty((q) => q + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1.5 rounded-md border" onClick={closePicker}>
                ยกเลิก
              </button>
              <button className="px-3 py-1.5 rounded-md bg-black text-white" onClick={confirmPick}>
                ใส่ตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal หลังสั่งซื้อ */}
      {success && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">สั่งซื้อสำเร็จ</div>
              <button
                className="text-gray-500 hover:text-black"
                onClick={() => setSuccess(null)}
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            {/* body */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
              <div className="text-sm text-gray-700">
                หมายเลขออร์เดอร์: <b>{success.orderId}</b>
              </div>

              <ul className="divide-y">
                {success.items.map((it, idx) => (
                  <li key={idx} className="py-2 grid grid-cols-[1fr,auto] gap-2">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-gray-500">ท็อปปิ้ง: {it.toppings}</div>
                      <div className="text-xs text-gray-500">จำนวน: {it.qty}</div>
                    </div>
                    <div className="text-right font-semibold whitespace-nowrap">
                      {formatTHB(it.lineTotal)}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">ยอดรวม</span>
                <span className="font-semibold">{formatTHB(success.total)}</span>
              </div>
            </div>

            {/* footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md border"
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
