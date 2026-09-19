import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const community = await prisma.community.upsert({
    where: { slug: "dandalin-saye-da-sayarwa" },
    update: {},
    create: {
      name: "Dandalin Saye da Sayarwa",
      slug: "dandalin-saye-da-sayarwa",
      description: "Strategic community partner for ArewaMart."
    }
  });

  const vendor = await prisma.vendor.upsert({
    where: { slug: "arewa-fashion-house" },
    update: {},
    create: {
      name: "Arewa Fashion House",
      slug: "arewa-fashion-house",
      description: "Hausa-inspired fashion and quality traditional wear.",
      phone: "08000000000",
      whatsapp: "2348000000000",
      location: "Kano, Nigeria",
      verified: true,
      communityId: community.id
    }
  });

  const categories = [
    ["Fashion", "Kayan Sawa", "fashion"],
    ["Beauty", "Kayan Kwalliya", "beauty"],
    ["Food & Groceries", "Abinci da Kayan Abinci", "food"],
    ["Home & Living", "Gida da Rayuwa", "home"],
    ["Electronics", "Na'urorin Lantarki", "electronics"]
  ] as const;

  for (const [name, nameHa, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, nameHa },
      create: { name, nameHa, slug }
    });
  }

  const fashion = await prisma.category.findUniqueOrThrow({ where: { slug: "fashion" } });

  const products = [
    {
      name: "Premium Hausa Kaftan",
      nameHa: "Babbar Jallabiya ta Hausa",
      slug: "premium-hausa-kaftan",
      description: "Elegant traditional kaftan suitable for weddings, Eid and special occasions.",
      price: 45000,
      compareAt: 55000,
      imageUrl: "https://images.unsplash.com/photo-1520975958225-96e31d8a1c15?auto=format&fit=crop&w=900&q=80",
      stock: 25,
      featured: true
    },
    {
      name: "Embroidered Senator Set",
      nameHa: "Atamfa Mai Ado",
      slug: "embroidered-senator-set",
      description: "Premium embroidered fabric and tailored senator outfit.",
      price: 65000,
      compareAt: 75000,
      imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
      stock: 12,
      featured: true
    },
    {
      name: "Classic Hausa Cap",
      nameHa: "Hular Hausa",
      slug: "classic-hausa-cap",
      description: "Hand-finished Hausa cap for everyday and ceremonial wear.",
      price: 12000,
      imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80",
      stock: 50,
      featured: false
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: { ...product, vendorId: vendor.id, categoryId: fashion.id }
    });
  }
}

main().finally(() => prisma.$disconnect());
