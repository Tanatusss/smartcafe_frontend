// toppingApi.ts
import { api } from "./axiosConfig";

export type ToppingDTO = {
  id: number;
  name: string;
  price: number;
};

// รองรับทั้ง price และ priceTopping (string/number)
type ToppingRaw = {
  id: number;
  name: string;
  price?: number | string;
  priceTopping?: number | string;
};

export async function fetchToppings(): Promise<ToppingDTO[]> {
  const { data } = await api.get<ToppingRaw[]>("/toppings");
  return data.map((topping) => {
    const raw = topping.price ?? topping.priceTopping ?? 0;
    const priceNum =
      typeof raw === "number" ? raw : Number(raw); // แปลงจาก string → number

    return {
      id: topping.id,
      name: topping.name,
      price: Number.isFinite(priceNum) ? priceNum : 0,
    };
  });
}
