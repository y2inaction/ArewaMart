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
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured") === "true";
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const where: any = {
      active: true,
    };

    if (category) where.category = { slug: category };
    if (vendor) where.vendor = { slug: vendor };
    if (featured) where.featured = true;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" as any } },
        { nameHa: { contains: q, mode: "insensitive" as any } }
      ];
    }

    const orderByMap: { [key: string]: any } = {
      "newest": { createdAt: "desc" },
      "oldest": { createdAt: "asc" },
      "price-low": { price: "asc" },
      "price-high": { price: "desc" },
      "featured": [{ featured: "desc" }, { createdAt: "desc" }],
      "popular": { viewCount: "desc" },
    };

    const orderBy = orderByMap[sort] || orderByMap["newest"];

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { vendor: true, category: true, images: { take: 1 } },
        skip,
        take: limit,
        orderBy,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      filters: { category, vendor, minPrice, maxPrice, sort, featured }
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
