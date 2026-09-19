import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;
  const products = await db.product.findMany({
    where: { active: true, ...(category ? { category: { slug: category } } : {}), ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { nameHa: { contains: q, mode: "insensitive" } }] } : {}) },
    include: { vendor: true, category: true },
    take: 50
  });
  return NextResponse.json(products);
}
