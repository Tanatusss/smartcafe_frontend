import { api } from "./axiosConfig";

/** ---- สำหรับ /order/:id (เดิมของคุณ) ---- */
export type OrderStatusResp = {
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED";
  items: { item_id: number; qty: number }[];   // << ไม่มี menu_name/toppings
  total_price: number;
  created_at: string;
  completed_at: string | null;
};
export async function getOrderStatus(id: number) {
  const { data } = await api.get<OrderStatusResp>(`/order/${id}`);
  return data;
}

/** ---- สำหรับ /allorder (ใหม่ ให้ตรง backend ของคุณ) ---- */
export type OrderStatusLower =
  | "pending"
  | "preparing"
  | "ready"
  | "completed"
  | "canceled";

export type AllOrdersItemResp = {
  qty: number;
  total_price_item: number;
  menu_name: string | null;
  toppings: string[]; // ชื่อท็อปปิ้ง
};

export type AllOrdersResp = {
  order_id: number;
  status: OrderStatusLower;     // backend map เป็นตัวพิมพ์เล็กแล้ว
  total_price: number;
  created_at: string;
  completed_at: string | null;
  user_id: number | null;
  items: AllOrdersItemResp[];   // << มี menu_name/toppings
};

export async function getAllOrders(): Promise<AllOrdersResp[]> {
  const { data } = await api.get<{ orders: AllOrdersResp[] }>("/allorder");
  return data.orders ?? [];
}

/** ---- mark ready ใช้ร่วมกันได้ ---- */
export type UpdateOrderStatusResp = {
  order_id: number;
  status: OrderStatusLower;     // backend ส่งกลับเป็นตัวพิมพ์เล็ก
  completed_at: string | null;
};
export async function markOrderReady(orderId: number) {
  const { data } = await api.patch<UpdateOrderStatusResp>(
    `/order/${orderId}/status`,
    { status: "READY" } // << ส่งพิมพ์ใหญ่ให้ Prisma/enum
  );
  return data;
}

/** ---- create order (เดิมของคุณ) ---- */
export type OrderItemReq = { item_id: number; qty: number; toppings?: number[] };
export type CreateOrderReq = { items: OrderItemReq[] };
export type CreateOrderResp = { order_id: number };
export async function createOrder(body: CreateOrderReq) {
  const { data } = await api.post<CreateOrderResp>("/order", body);
  return data;
}
