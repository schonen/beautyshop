import OpenAI from "openai";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

// Récupération de la clé API pour Groq
const apiKey = env.groqApiKey || env.openaiApiKey || process.env.GROQ_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Extraction très simple de critères depuis le message utilisateur.
 * Volontairement basique (regex) pour la V1 : c'est le filtrage PostgreSQL,
 * pas l'IA, qui garantit qu'on ne récupère que de vrais produits.
 */
function extractCriteria(message: string) {
  const lower = message.toLowerCase();

  const priceMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:000)?\s*(?:fcfa|f)/);
  const maxPrice = priceMatch ? Number(priceMatch[1].replace(",", ".")) * 1000 : undefined;

  const skinTypeMap: Record<string, string> = {
    sèche: "SEC",
    seche: "SEC",
    grasse: "GRAS",
    mixte: "MIXTE",
    normale: "NORMAL",
  };
  const skinType = Object.entries(skinTypeMap).find(([kw]) => lower.includes(kw))?.[1];

  return { maxPrice, skinType };
}

export const aiService = {
  async chat(userId: string, message: string) {
    if (!apiKey) {
      throw ApiError.badRequest("Le service IA n'est pas configuré (GROQ_API_KEY ou OPENAI_API_KEY manquante)");
    }

    const criteria = extractCriteria(message);

    // 1. On récupère UNIQUEMENT de vrais produits en base, jamais inventés par l'IA
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        ...(criteria.maxPrice && { price: { lte: criteria.maxPrice } }),
        ...(criteria.skinType && {
          OR: [{ skinType: criteria.skinType as any }, { skinType: "TOUS" }],
        }),
      },
      take: 5,
      orderBy: { price: "asc" },
    });

    const catalogContext = products
      .map((p) => `- ${p.name} : ${p.price} FCFA (peau: ${p.skinType}, stock: ${p.stock})`)
      .join("\n");

    // 2. On enregistre la conversation
    const conversation = await prisma.aIConversation.create({
      data: { userId, messages: { create: { role: "user", content: message } } },
    });

    // 3. On demande à l'IA de formuler une réponse avec le modèle gpt-oss-120b
    let reply = "Désolé, je n'ai pas de réponse.";

    try {
      const completion = await openai.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content:
              "Tu es l'assistant de BeautyShop, boutique de cosmétiques. " +
              "Tu réponds UNIQUEMENT à partir de la liste de produits fournie ci-dessous. " +
              "Ne jamais inventer un produit, un prix ou un stock qui n'est pas dans cette liste. " +
              "Si aucun produit ne correspond, dis-le clairement et propose d'élargir la recherche.\n\n" +
              `Produits disponibles :\n${catalogContext || "(aucun produit ne correspond)"}`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 400,
      });

      reply = completion.choices[0]?.message?.content ?? reply;
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API Groq :", error);

      if (error?.status === 429) {
        throw ApiError.badRequest("Le service IA a atteint sa limite de requêtes. Veuillez réessayer dans un instant.");
      }
      throw ApiError.internal("Une erreur est survenue lors de la communication avec l'assistant IA.");
    }

    // 4. Enregistrement de la réponse générée
    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: reply },
    });

    return { reply, products, conversationId: conversation.id };
  },
};