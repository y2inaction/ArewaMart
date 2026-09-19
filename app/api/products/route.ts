import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const vendor = searchParams.get("vendor");
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    const products = await db.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(vendor ? { vendor: { slug: vendor } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { nameHa: { contains: q, mode: "insensitive" } }] } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } } : {}),
      },
      include: { vendor: true, category: true, images: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await db.product.count({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(vendor ? { vendor: { slug: vendor } } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { nameHa: { contains: q, mode: "insensitive" } }] } : {}),
      },
    });

    return NextResponse.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
