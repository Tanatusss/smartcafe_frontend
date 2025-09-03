import { api } from "./axiosConfig";

export type OrderItemReq = { item_id: number; qty: number; toppings?: number[] };
export type CreateOrderReq = { items: OrderItemReq[]};
export type CreateOrderResp = { order_id: number };

export async function createOrder(body: CreateOrderReq) {
  const { data } = await api.post<CreateOrderResp>("/order", body);
  return data;
}

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
