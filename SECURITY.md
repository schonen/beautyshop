# Sécurité — BeautyShop

Ce document décrit les mesures de sécurité en place. Il s'adresse aux relecteurs
techniques (soutenance, code review) et aux futurs contributeurs.

## Authentification

- Mots de passe hachés avec **bcrypt** (coût 12), jamais stockés en clair,
  jamais renvoyés par l'API.
- Sessions stateless via **JWT**, algorithme forcé à `HS256` (signature comme
  vérification), `expiresIn` configurable (`JWT_EXPIRES_IN`).
- `JWT_SECRET` obligatoire au démarrage : le serveur refuse de démarrer s'il
  est absent **ou** trop court (< 32 caractères). Aucune valeur par défaut en
  dur dans le code.
- Le frontend stocke actuellement le token en `localStorage` (héritage du
  projet initial). C'est un risque connu (exposition en cas de XSS) :
  la migration recommandée pour une mise en production réelle est un cookie
  `HttpOnly; Secure; SameSite=Lax`, posé par le backend à la connexion. Cette
  migration n'a pas été faite dans cette passe pour ne pas casser le flux
  d'authentification existant sans tests d'intégration bout-en-bout ; elle est
  documentée ici comme prochaine étape prioritaire.

## Autorisation

- Middleware `authenticate` (vérifie/décode le JWT) + `authorize("ADMIN")`
  (vérifie le rôle **porté par le token signé**, jamais une valeur envoyée par
  le frontend) sur toutes les routes sensibles.
- Un client ne peut consulter/payer/annuler que **ses propres commandes**
  (vérification `order.userId === req.user.id` sauf pour un admin).
- Les routes `/admin/*` côté frontend s'appuient uniquement sur l'UI ; la
  vraie protection est côté backend (le frontend n'est jamais une barrière de
  sécurité suffisante).

## Validation des données

- Toutes les entrées passent par des schémas **Zod** avant d'atteindre un
  service (`validators/*.ts`), y compris un module commun
  (`common.validator.ts`) pour les numéros de téléphone camerounais, villes,
  montants, pagination, références de transaction.
- Toutes les requêtes base de données passent par **Prisma** (requêtes
  paramétrées) — aucune concaténation SQL manuelle nulle part.

## Intégrité des commandes et des paiements

- **Le frontend n'est jamais une source de vérité.** Le backend recalcule
  systématiquement `subtotal`, `deliveryFee` et `total` depuis la base au
  moment du checkout, et recalcule à nouveau le montant du paiement depuis la
  commande enregistrée (jamais depuis ce qu'envoie le client).
- **Ville de livraison** : contrôlée côté serveur
  (`deliveryCity === storeSettings.storeCity`), toute autre ville est rejetée
  avec un 400 explicite. Aucune livraison interurbaine possible.
- **Frais de livraison** : calculés côté serveur à partir des zones
  configurées, toujours bornés entre `minDeliveryFee` et `maxDeliveryFee`
  (1 000–2 500 FCFA par défaut). Un `deliveryFee: 0` envoyé par le client pour
  une livraison est ignoré.
- **Statut de paiement** : uniquement déterminé par le backend. Un client ne
  peut jamais envoyer `{ "status": "SUCCESS" }` pour se faire passer pour
  payé — le champ n'est même pas accepté en entrée par le schéma Zod du
  paiement.
- **Anti double-paiement** :
  - contrainte unique `Payment.orderId` (une commande ⇒ au plus un paiement)
    au niveau base de données, pas seulement applicative ;
  - vérification explicite avant création (`order.payment` déjà présent) ;
  - clé d'idempotence optionnelle (`Idempotency-Key`) : un double clic ou un
    retry réseau avec la même clé renvoie le paiement déjà créé au lieu d'en
    créer un second ;
  - la création du paiement + la mise à jour du statut de commande +
    les notifications se font dans **une seule transaction Prisma**
    (`prisma.$transaction`), avec rollback automatique en cas d'erreur.
- **Stock** : réservé (décrémenté) à la création de la commande pour éviter
  la survente ; restitué si la commande est annulée avant paiement.
  Les mises à jour de stock passent par les opérations atomiques Prisma
  (`decrement`/`increment`), pas par un `SELECT` puis `UPDATE` séparés, pour
  limiter les conditions de course entre deux achats simultanés.
- **Transitions de statut de commande** centralisées dans
  `order.service.ts` (table `ALLOWED_TRANSITIONS`) : impossible de faire
  passer une commande non payée directement à `DELIVERED`, ou une commande de
  retrait à `OUT_FOR_DELIVERY`.

## Carte bancaire (simulation)

- Le numéro de carte complet et le CVV **ne sont jamais stockés**. Seuls
  `cardLast4` (4 derniers chiffres) et la référence fictive
  (`CARD-SIM-...`) sont conservés en base.
- Aucune donnée de carte n'apparaît dans les notifications (client ou admin)
  ni dans les logs.

## En-têtes et middlewares Express

- **Helmet** (en-têtes de sécurité par défaut).
- **CORS** restreint à `FRONTEND_URL` (jamais `origin: "*"` avec
  `credentials: true`).
- **express-rate-limit** : limite globale, plus des limites dédiées et plus
  strictes sur `/auth/login`, `/auth/register`, `/ai/chat` et
  `/orders/:id/payment`.
- **HPP** (`hpp`) contre la pollution de paramètres HTTP.
- Payload JSON limité à `10kb`.

## Journalisation

- **Morgan** pour les logs HTTP (format `dev` en développement,
  `combined` en production).
- Ne sont **jamais** loggés : mots de passe, JWT, CVV, numéro de carte
  complet, clés API.

## Secrets et variables d'environnement

- `backend/.env` et `frontend/.env` sont ignorés par Git (`.gitignore` à la
  racine). Seuls `.env.example` (sans vraie valeur) sont versionnés.
- Aucune clé (`GROQ_API_KEY`, `OPENAI_API_KEY`, `JWT_SECRET`, mot de passe de
  base de données) n'est exposée au frontend : toutes les requêtes IA passent
  par le backend, jamais directement du navigateur vers Groq/OpenAI.
- Si une clé réelle a un jour été committée par erreur dans l'historique Git,
  elle doit être considérée comme compromise : la régénérer immédiatement
  chez le fournisseur concerné, pas seulement la retirer du code.

## Gestion des erreurs

- Système centralisé `ApiError` / `asyncHandler` / `errorHandler` : réponses
  JSON de forme cohérente (`{ success: false, message, details }`), jamais de
  stack trace renvoyée au client en production.

## Recommandations pour une mise en production réelle

1. Migrer l'authentification frontend vers un cookie `HttpOnly`.
2. Ajouter des tests d'intégration (Supertest + base de test dédiée) sur les
   parcours critiques : paiement, autorisation, transitions de statut.
3. Mettre en place une expiration automatique des commandes `PENDING_PAYMENT`
   trop anciennes (libération du stock réservé).
4. Faire tourner `npm audit` régulièrement et surveiller les CVE des
   dépendances (Express, Prisma, jsonwebtoken...).
5. Remplacer la simulation de paiement par une vraie intégration Orange
   Money / MTN / carte le jour où BeautyShop traite de vrais paiements —
   l'architecture (`payment.service.ts`) est conçue pour ce remplacement sans
   réécrire le reste de l'application.
