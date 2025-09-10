import { api } from "./axiosConfig";

/** ---- สำหรับ /order/:id ---- */
export type OrderStatusResp = {
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";
  items: { item_id: number; qty: number }[];   
  total_price: number;
  created_at: string;
  completed_at: string | null;
};
export async function getOrderStatus(id: number) {
  const { data } = await api.get<OrderStatusResp>(`/order/${id}`);
  return data;
}

/** ---- สำหรับ /allorder ---- */
export type OrderStatusLower =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "canceled";

export type AllOrdersItemResp = {
  qty: number;
  total_price_item: number; //(qty * unit_price)
  menu_name: string | null;
  toppings: string[]; 
};

export type AllOrdersResp = {
  order_id: number;
  status: OrderStatusLower;     // backend map เป็นตัวพิมพ์เล็ก
  total_price: number;
  created_at: string;
  completed_at: string | null;
  user_id: number | null;
  items: AllOrdersItemResp[];   
};

export async function getAllOrders(): Promise<AllOrdersResp[]> {
  const { data } = await api.get<{ orders: AllOrdersResp[] }>("/allorder");
  return data.orders ?? [];
}

/** ---- mark ready ---- */
export type UpdateOrderStatusResp = {
  order_id: number;
  status: OrderStatusLower;    
  completed_at: string | null;
};
export async function markOrderReady(orderId: number) {
  const { data } = await api.patch<UpdateOrderStatusResp>(
    `/order/${orderId}/status`,
    { status: "READY" } 
  );
  return data;
}

/** ---- create order ---- */
export type OrderItemReq = { item_id: number; qty: number; toppings?: number[] };
export type CreateOrderReq = { items: OrderItemReq[] };
export type CreateOrderResp = { order_id: number };
export async function createOrder(body: CreateOrderReq) {
  const { data } = await api.post<CreateOrderResp>("/order", body);
  return data;
}

/** ---- รวมข้อมูลสำหรับหน้า Status ---- */
export type OrderItemDTO = {
  item_id: number | null;        
  qty: number;
  menu_name: string | null;
  toppings: string[];
  unit_price: number | null;     
  total_price_item: number | null;
};

export type OrderDetailResp = {
  status: OrderStatusLower;
  total_price: number;
  created_at: string;
  completed_at: string | null;
  items: OrderItemDTO[];
};

// แปลงสถานะตัวใหญ่จาก /order/:id ให้เป็นพิมพ์เล็ก
const normalizeStatus = (s: string): OrderStatusLower =>
  (s || "").toLowerCase() as OrderStatusLower;


export async function getOrderDetail(orderId: number): Promise<OrderDetailResp> {
  
  const base = await getOrderStatus(orderId);

  // ใส่ค่าเริ่มต้นสำหรับ UI
  let detail: OrderDetailResp = {
    status: normalizeStatus(base.status),
    total_price: base.total_price,
    created_at: base.created_at,
    completed_at: base.completed_at,
    items: base.items.map((it) => ({
      item_id: it.item_id,
      qty: it.qty,
      menu_name: null,
      toppings: [],
      unit_price: null,
      total_price_item: null,
    })),
  };

  try {
    const all = await getAllOrders();
    const found = all.find((o) => o.order_id === orderId);
    if (found) {
      detail = {
        status: found.status,
        total_price: found.total_price,
        created_at: found.created_at,
        completed_at: found.completed_at,
        items: found.items.map((it) => ({
          item_id: null, // /allorder ไม่มี
          qty: it.qty,
          menu_name: it.menu_name,
          toppings: it.toppings ?? [],
          unit_price: it.qty > 0 ? it.total_price_item / it.qty : null,
          total_price_item: it.total_price_item,
        })),
      };
    }
  } catch {
    // ถ้า /allorder ล้มเหลว ก็ใช้ detail จาก /order/:id ต่อได้
  }

  return detail;
}
