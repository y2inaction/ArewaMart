'use dynamic';

import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import type { Product, Category, Vendor } from "@prisma/client";

type ProductWithRelations = Product & { vendor: { name: string; verified: boolean } | null; category: { name: string } | null };
type VendorWithCommunity = Vendor & { community: { name: string } | null };

export default async function Home() {
  let products: ProductWithRelations[] = [];
  let categories: Category[] = [];
  let vendors: VendorWithCommunity[] = [];

  try {
    [products, categories, vendors] = await Promise.all([
      db.product.findMany({ where: { active: true }, include: { vendor: true, category: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 8 }),
      db.category.findMany({ take: 8 }),
      db.vendor.findMany({ where: { verified: true }, include: { community: true }, take: 4 })
    ]);
  } catch (error) {
    console.error('Database error:', error);
  }

  return (
    <main>
      <section className="bg-emerald-900 text-white">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white/10 px-4 py-2 rounded-full text-sm">Arewa businesses · Hausa-first</span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mt-5">Saye da Sayarwa cikin sauƙi.</h1>
            <p className="text-emerald-50 text-lg mt-5 max-w-xl">Nemo kayayyaki daga amintattun masu sayarwa a Arewa. Yi oda online ko ta WhatsApp.</p>
            <div className="flex gap-3 mt-8">
              <Link href="#products" className="bg-white text-emerald-900 px-6 py-3 rounded-full font-bold">Fara Siyayya</Link>
              <Link href="/vendor" className="border border-white/30 px-6 py-3 rounded-full font-bold">Sayar da Kaya</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-8 border border-white/10">
            <div className="text-sm text-emerald-100">Me yasa ArewaMart?</div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              {["Verified Vendors", "WhatsApp-ready", "Hausa + English", "Community-powered"].map(x => <div key={x} className="bg-white/10 rounded-2xl p-5 font-bold">{x}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex items-end justify-between"><div><p className="text-emerald-700 font-bold">Kashi</p><h2 className="text-2xl font-black">Nemo abin da kake so</h2></div></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          {categories.map(c => <Link key={c.id} href={`/search?category=${c.slug}`} className="bg-white border rounded-2xl p-5 font-bold hover:border-emerald-500">{c.nameHa}<span className="block text-xs text-gray-400 mt-1">{c.name}</span></Link>)}
        </div>
      </section>

      <section id="products" className="container py-8">
        <div className="flex items-end justify-between"><div><p className="text-emerald-700 font-bold">Featured</p><h2 className="text-3xl font-black">Kayayyakin da aka zaba</h2></div><Link href="/search" className="font-bold text-emerald-700">Duba duka →</Link></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
      </section>

      <section className="container py-10">
        <div className="rounded-3xl bg-amber-50 p-8 md:p-12">
          <p className="text-emerald-700 font-bold">Ga masu sayarwa</p>
          <h2 className="text-3xl font-black mt-2">Ka mayar da sana'arka kasuwancin zamani.</h2>
          <p className="mt-3 max-w-2xl text-gray-700">ArewaMart na taimaka wa masu sayarwa su samu ƙarin gani, amincewa da hanyoyin karɓar oda daga kwastomomi.</p>
          <Link href="/vendor" className="inline-block mt-6 bg-emerald-800 text-white rounded-full px-6 py-3 font-bold">Bude Shago</Link>
        </div>
      </section>

      <section className="container py-8">
        <h2 className="text-2xl font-black">Amintattun al'ummomi</h2>
        <div className="grid md:grid-cols-4 gap-4 mt-5">{vendors.map(v => <div key={v.id} className="bg-white border rounded-2xl p-5"><b>{v.name}</b><p className="text-sm text-gray-500 mt-2">{v.community?.name || "ArewaMart Vendor"}</p></div>)}</div>
      </section>
    </main>
  );
}
