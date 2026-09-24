export function formatPrice(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("fr-FR").format(num) + " FCFA";
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

export const orderStatusLabels: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY_FOR_PICKUP: "Prête pour retrait",
  OUT_FOR_DELIVERY: "En cours de livraison",
  DELIVERED: "Livrée",
  PICKED_UP: "Retirée",
  CANCELLED: "Annulée",
};

export const orderStatusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY_FOR_PICKUP: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  PICKED_UP: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const paymentMethodLabels: Record<string, string> = {
  ORANGE_MONEY: "Orange Money",
  MTN_MOBILE_MONEY: "MTN Mobile Money",
  CARD: "Carte bancaire",
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: "En attente",
  SUCCESS: "Réussi",
  FAILED: "Échoué",
  CANCELLED: "Annulé",
};

export const fulfillmentMethodLabels: Record<string, string> = {
  DELIVERY: "Livraison à domicile",
  PICKUP: "Retrait en boutique",
};

export const skinTypeLabels: Record<string, string> = {
  NORMAL: "Peau normale",
  SEC: "Peau sèche",
  GRAS: "Peau grasse",
  MIXTE: "Peau mixte",
  TOUS: "Tous types de peau",
};
