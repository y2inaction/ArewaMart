import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export default async function VendorStore({ params }: { params: Promise<{slug:string}> }) {
  const {slug} = await params;
  const vendor = await db.vendor.findUnique({ where: {slug}, include: {products: {include: {vendor:true, category:true}, where:{active:true}}}});
  if (!vendor) notFound();
  return <main className="container py-10"><div className="bg-emerald-900 text-white rounded-3xl p-8"><div className="text-emerald-200">{vendor.verified ? "✓ Verified Vendor" : "Vendor"}</div><h1 className="text-4xl font-black mt-2">{vendor.name}</h1><p className="mt-2">{vendor.description}</p><p className="mt-3 text-sm">{vendor.location}</p></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">{vendor.products.map(p=><ProductCard key={p.id} product={p}/>)}</div></main>
}
