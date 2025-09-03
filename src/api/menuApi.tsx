// menuApi.ts
import { api } from "./axiosConfig";

export type MenuItemDTO = {
  item_id: number;
  name: string;
  price: number;   
  img: string;
};

// รองรับทั้ง price และ priceItem ที่อาจเป็น string/number จากหลังบ้าน
type MenuItemRaw = {
  item_id: number;
  name: string;
  price?: number | string;
  priceItem?: number | string;
  img?: string;
};

export async function fetchMenu(): Promise<MenuItemDTO[]> {
  const { data } = await api.get<MenuItemRaw[]>("/menu"); // <-- endpoint ของคุณ
  return data.map((r) => {
    const raw = r.price ?? r.priceItem ?? 0;
    const priceNum = typeof raw === "number" ? raw : Number(raw);
    return {
      item_id: r.item_id,
      name: r.name,
      price: Number.isFinite(priceNum) ? priceNum : 0,
      img: r.img ?? "",
    };
  });
}
