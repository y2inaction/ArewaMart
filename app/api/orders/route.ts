import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  address: z.string().min(5),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1) })).min(1)
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const products = await db.product.findMany({ where: { id: { in: body.items.map(i => i.id) }, active: true }, include: { vendor: true } });
    if (products.length !== body.items.length) return NextResponse.json({ error: "Some products are unavailable." }, { status: 400 });

    const subtotal = products.reduce((sum, p) => {
      const qty = body.items.find(i => i.id === p.id)!.quantity;
      return sum + p.price * qty;
    }, 0);

    let customer = await db.user.findFirst({ where: { phone: body.phone } });
    if (!customer) customer = await db.user.create({ data: { name: body.name, phone: body.phone, email: `${body.phone}@customer.arewamart.local` } });

    const orderNumber = `AM-${Date.now().toString(36).toUpperCase()}`;
    const order = await db.order.create({
      data: {
        orderNumber, customerId: customer.id, subtotal, total: subtotal, address: body.address, whatsapp: body.phone,
        vendorId: products[0].vendorId,
        items: { create: products.map(p => ({ productId: p.id, quantity: body.items.find(i => i.id === p.id)!.quantity, unitPrice: p.price })) }
      }
    });
    return NextResponse.json({ orderNumber: order.orderNumber });
  } catch {
    return NextResponse.json({ error: "Invalid order request." }, { status: 400 });
  }
}
