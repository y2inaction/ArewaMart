import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatNaira } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { AddToCart } from "./AddToCart";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { vendor: true, category: true } });
  if (!product) notFound();

  const wa = product.vendor.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const message = `Sannu, ina sha'awar ${product.name} a ArewaMart. Farashi: ${formatNaira(product.price)}.`;
  return (
    <main className="container py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <img src={product.imageUrl} alt={product.name} className="w-full rounded-3xl aspect-square object-cover" />
        <div className="py-4">
          <div className="text-emerald-700 font-bold">{product.vendor.verified ? "✓ Verified Vendor" : "Vendor"}</div>
          <h1 className="text-4xl font-black mt-2">{product.name}</h1>
          <p className="text-gray-500 mt-2">{product.nameHa}</p>
          <div className="text-3xl font-black mt-6">{formatNaira(product.price)}</div>
          {product.compareAt && <div className="text-gray-400 line-through">{formatNaira(product.compareAt)}</div>}
          <p className="mt-6 text-gray-700 leading-7">{product.description}</p>
          <p className="mt-4 text-sm">Mai sayarwa: <b>{product.vendor.name}</b> · {product.vendor.location}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <AddToCart product={product} />
            {wa && <a href={whatsappUrl(wa, message)} target="_blank" className="rounded-full border border-emerald-700 text-emerald-800 px-6 py-3 font-bold">Order via WhatsApp</a>}
          </div>
        </div>
      </div>
    </main>
  );
}
