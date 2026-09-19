 "use client";
import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format";

export default function Checkout() {
  const [cart, setCart] = useState<any[]>([]);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState("");
  const [done, setDone] = useState("");
  useEffect(() => setCart(JSON.parse(localStorage.getItem("arewamart-cart") || "[]")), []);
  const total = cart.reduce((n, x) => n + x.price * x.quantity, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/orders", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({name, phone, address, items: cart}) });
    const data = await res.json();
    if (res.ok) { setDone(data.orderNumber); localStorage.removeItem("arewamart-cart"); setCart([]); }
    else alert(data.error || "An samu matsala.");
  }
  if (done) return <main className="container py-20 text-center"><h1 className="text-4xl font-black">An karɓi odarka!</h1><p className="mt-3">Order: <b>{done}</b></p><p className="text-gray-500 mt-2">Za mu ci gaba da tuntuɓarka kan oda da isarwa.</p></main>;

  return <main className="container py-10 max-w-3xl"><h1 className="text-3xl font-black">Checkout</h1>
    <form onSubmit={submit} className="bg-white border rounded-2xl p-6 mt-6 space-y-4">
      <input required placeholder="Cikakken suna" value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-xl p-3"/>
      <input required placeholder="Lambar waya" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border rounded-xl p-3"/>
      <textarea required placeholder="Adireshin isarwa" value={address} onChange={e=>setAddress(e.target.value)} className="w-full border rounded-xl p-3 min-h-28"/>
      <div className="flex justify-between font-bold pt-4 border-t"><span>Jimilla</span><span>{formatNaira(total)}</span></div>
      <button disabled={!cart.length} className="w-full bg-emerald-800 disabled:bg-gray-300 text-white rounded-xl py-3 font-bold">Aika Oda</button>
    </form>
  </main>;
}
