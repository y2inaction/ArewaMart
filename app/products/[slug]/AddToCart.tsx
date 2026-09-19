 "use client";
export function AddToCart({ product }: { product: any }) {
  return <button onClick={() => {
    const cart = JSON.parse(localStorage.getItem("arewamart-cart") || "[]");
    const existing = cart.find((x: any) => x.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1, vendorName: product.vendor.name });
    localStorage.setItem("arewamart-cart", JSON.stringify(cart));
    alert("An saka kaya a cart.");
  }} className="rounded-full bg-emerald-800 text-white px-7 py-3 font-bold">Saka a Cart</button>;
}
