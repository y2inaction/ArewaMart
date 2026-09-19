 "use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  useEffect(() => setCart(JSON.parse(localStorage.getItem("arewamart-cart") || "[]")), []);
  const total = cart.reduce((n, x) => n + x.price * x.quantity, 0);

  function save(next: any[]) { setCart(next); localStorage.setItem("arewamart-cart", JSON.stringify(next)); }

  return <main className="container py-10">
    <h1 className="text-3xl font-black">Cart</h1>
    {cart.length === 0 ? <div className="py-20 text-center"><p className="text-gray-500">Cart ɗinka babu komai.</p><Link href="/" className="inline-block mt-5 bg-emerald-800 text-white rounded-full px-6 py-3 font-bold">Ci gaba da Siyayya</Link></div> :
    <div className="grid md:grid-cols-[1fr_360px] gap-8 mt-8">
      <div className="space-y-3">{cart.map(x => <div key={x.id} className="bg-white border rounded-2xl p-4 flex gap-4 items-center">
        <img src={x.imageUrl} className="w-20 h-20 rounded-xl object-cover" />
        <div className="flex-1"><b>{x.name}</b><div className="text-sm text-gray-500">{x.vendorName}</div><div>{formatNaira(x.price)}</div></div>
        <input type="number" min="1" value={x.quantity} onChange={e => save(cart.map(i => i.id === x.id ? {...i, quantity: Number(e.target.value)} : i))} className="w-16 border rounded-lg p-2" />
        <button onClick={() => save(cart.filter(i => i.id !== x.id))} className="text-red-600 text-sm">Cire</button>
      </div>)}</div>
      <aside className="bg-white border rounded-2xl p-6 h-fit"><div className="flex justify-between"><span>Jimilla</span><b>{formatNaira(total)}</b></div><Link href="/checkout" className="block text-center mt-5 bg-emerald-800 text-white rounded-full py-3 font-bold">Ci gaba zuwa Checkout</Link></aside>
    </div>}
  </main>;
}
