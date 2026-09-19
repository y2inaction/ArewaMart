 "use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("arewamart-cart") || "[]");
        setCount(cart.reduce((n: number, x: any) => n + x.quantity, 0));
      } catch {}
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
      <div className="container h-16 flex items-center gap-5">
        <Link href="/" className="text-2xl font-black text-emerald-800">ArewaMart</Link>
        <span className="hidden md:block text-xs text-gray-500">Saye da Sayarwa</span>
        <form action="/search" className="hidden md:flex flex-1">
          <input name="q" placeholder="Nemo kaya..." className="w-full rounded-full border px-5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-200" />
        </form>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/vendor">Sayar da kaya</Link>
          <Link href="/cart" className="font-bold">Cart ({count})</Link>
        </nav>
      </div>
    </header>
  );
}
