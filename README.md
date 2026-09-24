# BeautyShop

Plateforme e-commerce de produits cosmétiques : catalogue, panier, checkout avec
livraison/retrait, paiement simulé (Orange Money / MTN Mobile Money / carte),
notifications, espace admin et assistant IA.

> **Le paiement est une simulation pédagogique.** Aucun service financier réel
> n'est appelé et aucun argent réel n'est débité — voir [SECURITY.md](./SECURITY.md).

## Stack

- **Frontend** : Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Backend** : Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- **Sécurité** : JWT (HS256), bcrypt, Zod, Helmet, CORS, express-rate-limit, HPP
- **IA** : API compatible OpenAI (Groq)

## Structure

```
beautyshop/
├── frontend/     # Next.js App Router
├── backend/      # API REST Express + Prisma
├── .gitignore
├── README.md
└── SECURITY.md
```

## Prérequis

- Node.js ≥ 18
- PostgreSQL ≥ 14 (local ou managé)

## Démarrage — Backend

```bash
cd backend
cp .env.example .env        # renseigner DATABASE_URL, JWT_SECRET, GROQ_API_KEY...
npm install
npx prisma generate         # génère le client Prisma à partir de schema.prisma
npx prisma migrate dev      # applique les migrations (crée les tables)
npm run prisma:seed         # admin + 5 catégories + 16 produits + paramètres boutique
npm run dev                 # http://localhost:4000
```

Générer un `JWT_SECRET` sûr :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Sur un dépôt déjà cloné avec une base PostgreSQL vide, `prisma migrate dev`
> suffit. Si tu repars d'une base existante avec l'ancien schéma (avant
> checkout/paiement), la migration fournie recrée l'énumération de statut de
> commande : en développement, `npx prisma migrate reset` est plus simple et
> plus sûr qu'un `migrate deploy` sur des données de démo.

Compte admin de test créé par le seed : `admin@beautyshop.com` / `Admin123!`
**— développement uniquement, à changer avant toute mise en production.**

## Démarrage — Frontend

```bash
cd frontend
cp .env.example .env        # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:3000
```

## Tests

```bash
cd backend
npm test                    # Vitest : validators (téléphone, checkout, paiement), auth...
```

## Paiement simulé

Le module de paiement (`payment.service.ts`) est architecturé comme un vrai
module métier (idempotence, transaction atomique, recalcul serveur du montant,
protections anti double-paiement) afin de pouvoir être branché plus tard sur
une vraie passerelle Orange Money / MTN / carte sans réécrire l'application —
il suffira de remplacer la génération de référence fictive par un véritable
appel à la passerelle, à l'intérieur de `payment.service.simulate()`.

## Livraison

BeautyShop ne livre que dans la ville où se trouve la boutique
(`StoreSettings.storeCity`, modifiable par un admin via
`PUT /api/settings/store`). Les frais de livraison sont calculés côté serveur
à partir des zones (`DeliveryZone`, 1 000 à 2 500 FCFA) et ne sont **jamais**
acceptés depuis le frontend.

## Endpoints principaux

| Méthode | Route                              | Accès    |
|---------|-------------------------------------|----------|
| POST    | /api/auth/register, /login          | Public   |
| GET     | /api/auth/me                        | Connecté |
| GET     | /api/products, /categories          | Public   |
| POST/PUT/DELETE | /api/products/..., /categories/... | Admin |
| POST    | /api/orders                         | Connecté |
| GET     | /api/orders/mine, /:id              | Connecté |
| GET     | /api/orders                         | Admin    |
| PATCH   | /api/orders/:id/status              | Admin    |
| POST    | /api/orders/:orderId/payment        | Connecté |
| GET     | /api/orders/:orderId/payment        | Connecté |
| POST    | /api/orders/:orderId/cancel         | Connecté |
| GET     | /api/notifications                  | Connecté |
| PATCH   | /api/notifications/:id/read, /read-all | Connecté |
| GET     | /api/settings/store, /delivery-zones | Public  |
| PUT/POST/DELETE | /api/settings/...           | Admin    |
| POST    | /api/ai/chat                        | Connecté |

## Déploiement

- **Backend** : n'importe quel hébergeur Node (Render, Railway, Fly.io…) +
  PostgreSQL managé. En production : `npx prisma migrate deploy`,
  `NODE_ENV=production`, `JWT_SECRET` long et aléatoire, `FRONTEND_URL` pointant
  vers le domaine réel (jamais `origin: "*"` avec `credentials: true`).
- **Frontend** : Vercel ou tout hébergeur Next.js. Ne définir en
  `NEXT_PUBLIC_*` que des valeurs non sensibles (l'URL de l'API uniquement).

## Ce qui reste hors périmètre de cette passe

Documenté par transparence plutôt que passé sous silence :
- Notifications temps réel : la structure (modèle `Notification`, endpoints
  REST, compteur non-lus) est en place, mais le flux SSE
  (`GET /api/notifications/stream`) n'est pas encore implémenté — l'admin
  utilise pour l'instant un rafraîchissement/polling côté frontend.
- Suite de tests limitée aux validators (Zod) qui ne nécessitent pas de base
  de données ; les tests d'intégration (services, routes avec DB réelle) sont
  à ajouter avec une base de test dédiée.
- Statistiques de vente par période (jour/semaine/mois/année) : l'architecture
  le permet (index sur `createdAt`), mais seuls les totaux globaux sont
  exposés pour l'instant.
