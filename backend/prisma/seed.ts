import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const CATEGORY_NAMES = [
  "Soins du visage",
  "Protection solaire",
  "Soins du corps",
  "Soins capillaires",
  "Maquillage",
] as const;

async function seedAdmin() {
  const adminPasswordHash = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@beautyshop.com" },
    update: {},
    create: {
      name: "Admin BeautyShop",
      email: "admin@beautyshop.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin créé :", admin.email, "(compte de développement uniquement — changer le mot de passe en production)");
}

async function seedCategories() {
  const categories = await Promise.all(
    CATEGORY_NAMES.map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  console.log(`✅ ${categories.length} catégories créées`);
  return Object.fromEntries(categories.map((c) => [c.name, c.id])) as Record<
    (typeof CATEGORY_NAMES)[number],
    string
  >;
}

async function seedProducts(categoryId: Record<(typeof CATEGORY_NAMES)[number], string>) {
  const products = [
    // Soins du visage
    { brand: "CeraVe", name: "Gel Moussant Nettoyant Visage", description: "Gel moussant nettoyant qui élimine les impuretés sans agresser la barrière cutanée.", price: 11000, stock: 24, skinType: "TOUS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240080/cerave-gel-moussant.jpg" },
    { brand: "Garnier", name: "SkinActive Eau Micellaire Tout-en-1 (Bouchon Rose)", description: "Eau micellaire démaquillante et nettoyante pour toutes les peaux, même sensibles.", price: 6500, stock: 40, skinType: "TOUS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240096/garnier-eau-micellaire.jpg" },
    { brand: "La Roche-Posay", name: "Effaclar Duo+ M (Soin Anti-Imperfections)", description: "Soin correcteur anti-imperfections qui réduit boutons et marques résiduelles.", price: 14000, stock: 18, skinType: "GRAS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240131/larocheposay-effaclar-duo.jpg" },
    { brand: "Nivea", name: "Luminous 630 Anti-Taches Sérum Concentré", description: "Sérum concentré qui cible les taches pigmentaires et unifie le teint.", price: 15000, stock: 15, skinType: "TOUS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240192/nivea-luminous-630.jpg" },
    { brand: "Garnier", name: "SkinActive Sérum Booster d'Éclat Vitamine C", description: "Sérum à la vitamine C qui booste l'éclat du teint dès les premières applications.", price: 9500, stock: 22, skinType: "TOUS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240107/garnier-vitamine-c.jpg" },
    { brand: "Mixa", name: "Anti-Imperfections Gel Nettoyant Sans Savon", description: "Gel nettoyant sans savon formulé pour les peaux à imperfections.", price: 7000, stock: 30, skinType: "GRAS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240151/mixa-gel-nettoyant.jpg" },
    { brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", description: "Sérum concentré en niacinamide et zinc pour réguler les excès de sébum.", price: 8500, stock: 20, skinType: "GRAS", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240291/ordinary-niacinamide.jpg" },
    { brand: "Nivea", name: "Soft Crème Hydratante Intensif", description: "Crème légère hydratante visage, mains et corps, absorption rapide.", price: 6500, stock: 35, skinType: "SEC", category: "Soins du visage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240210/nivea-soft.jpg" },
    // Protection solaire
    { brand: "La Roche-Posay", name: "Anthelios UVMune 400 Fluide Invisible SPF 50+", description: "Fluide solaire invisible haute protection, texture non grasse.", price: 13500, stock: 16, skinType: "TOUS", category: "Protection solaire", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240118/larocheposay-anthelios.jpg" },
    { brand: "Nivea Sun", name: "Protect & Refresh Spray Solaire SPF 50", description: "Spray solaire rafraîchissant haute protection, application facile.", price: 12000, stock: 20, skinType: "TOUS", category: "Protection solaire", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240238/nivea-sun.jpg" },
    // Soins du corps
    { brand: "Mixa", name: "Lait Corps Réparateur Intensif Peaux Très Sèches", description: "Lait corps réparateur pour peaux très sèches sujettes à l'inconfort.", price: 8000, stock: 25, skinType: "SEC", category: "Soins du corps", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790240165/mixa-lait-corps.jpg" },
    { brand: "Nivea", name: "Lotion Corps Nourrissant Soin Essentiel", description: "Lotion corps nourrissante au quotidien, absorption rapide.", price: 7500, stock: 30, skinType: "TOUS", category: "Soins du corps", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790241780/nivea-lotion-corps.jpg" },
    { brand: "Palmer's", name: "Formule au Beurre de Cacao (Lotion Hydratante)", description: "Lotion hydratante au beurre de cacao pour une peau souple et nourrie.", price: 9000, stock: 22, skinType: "SEC", category: "Soins du corps", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790241734/palmers-cacao.jpg" },
    { brand: "Mixa", name: "Cica-Crème Réparatrice Mains", description: "Crème réparatrice pour mains abîmées ou sèches, formule apaisante.", price: 6500, stock: 28, skinType: "SEC", category: "Soins du corps", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790241807/mixa-cica-creme.jpg" },
    // Soins capillaires
    { brand: "Garnier Ultra Doux", name: "Masque Hair Food Banane Nourrissant", description: "Masque capillaire nourrissant à la banane pour cheveux secs et ternes.", price: 8500, stock: 20, skinType: "TOUS", category: "Soins capillaires", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790241874/garnier-hair-food-banane.jpg" },
    // Maquillage
    { brand: "Maybelline New York", name: "Fit Me! Matte + Poreless (Fond de Teint)", description: "Fond de teint matifiant qui minimise l'apparence des pores.", price: 10500, stock: 18, skinType: "TOUS", category: "Maquillage", imageUrl: "https://res.cloudinary.com/dvfakaah5/image/upload/v1790241844/maybelline-fit-me.jpg" },
  ] as const;

  await prisma.product.createMany({
    data: products.map((p) => ({
      brand: p.brand,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      skinType: p.skinType,
      imageUrl: p.imageUrl,
      categoryId: categoryId[p.category],
    })),
    skipDuplicates: true,
  });
  console.log(`✅ ${products.length} produits du catalogue créés`);
}

async function seedStoreSettings() {
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "BeautyShop",
      storeCity: "Douala",
      storeAddress: "Akwa, Rue de la Joie, Douala",
      storePhone: "655000000",
      currency: "XAF",
      deliveryEnabled: true,
      minDeliveryFee: 1000,
      maxDeliveryFee: 2500,
      lowStockThreshold: 5,
    },
  });
  console.log("✅ Paramètres boutique créés (ville : Douala)");

  const zones = [
    { name: "Akwa", fee: 1000, isDefault: false },
    { name: "Bonanjo", fee: 1000, isDefault: false },
    { name: "Bonapriso", fee: 1500, isDefault: true },
    { name: "Bépanda", fee: 2000, isDefault: false },
    { name: "Kotto", fee: 2500, isDefault: false },
  ];
  await Promise.all(
    zones.map((z) => prisma.deliveryZone.upsert({ where: { name: z.name }, update: z, create: z }))
  );
  console.log(`✅ ${zones.length} zones de livraison créées`);
}

async function main() {
  await seedAdmin();
  const categoryId = await seedCategories();
  await seedProducts(categoryId);
  await seedStoreSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });