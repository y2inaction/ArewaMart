 "use client";
import Link from "next/link";
import { formatNaira } from "@/lib/format";

export function ProductCard({ product }: { product: any }) {
  function add() {
    const cart = JSON.parse(localStorage.getItem("arewamart-cart") || "[]");
    const existing = cart.find((x: any) => x.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1, vendorName: product.vendor.name });
    localStorage.setItem("arewamart-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <article className="group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition">
      <Link href={`/products/${product.slug}`}>
        <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-[1.02] transition" />
      </Link>
      <div className="p-4">
        <div className="text-xs text-emerald-700 font-semibold">{product.vendor.verified ? "✓ Verified Vendor" : "Vendor"}</div>
        <Link href={`/products/${product.slug}`} className="font-bold block mt-1">{product.name}</Link>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div><div className="font-black text-lg">{formatNaira(product.price)}</div>{product.compareAt && <div className="text-xs text-gray-400 line-through">{formatNaira(product.compareAt)}</div>}</div>
          <button onClick={add} className="rounded-full bg-emerald-700 text-white px-4 py-2 text-sm font-bold">Sayi</button>
        </div>
      </div>
    </article>
  );
}
