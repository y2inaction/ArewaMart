import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{q?: string; category?: string}> }) {
  const p = await searchParams;
  const products = await db.product.findMany({
    where: { active: true, ...(p.category ? { category: { slug: p.category } } : {}), ...(p.q ? { OR: [{ name: { contains: p.q, mode: "insensitive" } }, { nameHa: { contains: p.q, mode: "insensitive" } }] } : {}) },
    include: { vendor: true, category: true }, take: 60
  });
  return <main className="container py-10"><h1 className="text-3xl font-black">{p.q ? `Sakam: ${p.q}` : "Duk Kayayyaki"}</h1><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-7">{products.map(x => <ProductCard key={x.id} product={x}/>)}</div>{!products.length && <p className="py-20 text-center text-gray-500">Ba a samu kaya ba.</p>}</main>
}
