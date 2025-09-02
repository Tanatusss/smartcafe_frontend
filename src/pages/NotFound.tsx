import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="py-10">
      <h1 className="text-2xl font-semibold">404 - Page not found</h1>
      <p className="text-gray-600 mt-2">ไม่มีหน้านี้นะครับ</p>
      <Link to="/" className="inline-block mt-4 rounded-lg border px-3 py-1.5">
        กลับหน้าแรก
      </Link>
    </section>
  );
}
