"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useCart } from "@/lib/cart-context";
import { api } from "@/lib/api";
import { ApiClientError } from "@/lib/auth-context";
import { createIdempotencyKey } from "@/lib/payment/idempotency";
import { Order, StoreSettings, FulfillmentInput, ApiResponse, Payment } from "@/types";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabels } from "@/lib/format";
import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FulfillmentChoice } from "@/components/checkout/FulfillmentChoice";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethodForm } from "@/components/payment/PaymentMethodForm";

type Step = "delivery" | "payment" | "confirmation";

const STEPS: { key: Step; label: string }[] = [
  { key: "delivery", label: "Livraison" },
  { key: "payment", label: "Paiement" },
  { key: "confirmation", label: "Confirmation" },
];

export default function CheckoutPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { items, clear } = useCart();

  const [step, setStep] = useState<Step>("delivery");
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [fulfillment, setFulfillment] = useState<FulfillmentInput>({
    fulfillmentMethod: "PICKUP",
    customerName: "",
    customerPhone: "",
  });
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<StoreSettings>>("/settings/store", { auth: false })
      .then((res) => setStoreSettings(res.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) {
      setFulfillment((f) => ({ ...f, customerName: f.customerName || user.name, customerPhone: f.customerPhone || user.phone || "" }));
    }
  }, [user]);

  if (authLoading) return null;

  if (items.length === 0 && step !== "confirmation") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Ton panier est vide</h1>
        <Link href="/produits" className="mt-6 inline-block">
          <Button>Voir les produits</Button>
        </Link>
      </div>
    );
  }

  async function handleCreateOrder() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<Order>>("/orders", {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        fulfillment,
      });
      setOrder(res.data);
      setIdempotencyKey(createIdempotencyKey());
      setStep("payment");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Impossible de créer la commande");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToDelivery() {
    if (order) {
      try {
        await api.post(`/orders/${order.id}/cancel`);
      } catch {
        // la commande a peut-être déjà été payée entre-temps : on laisse l'utilisateur revenir quand même
      }
    }
    setOrder(null);
    setError(null);
    setStep("delivery");
  }

  async function handlePay(payload: Record<string, unknown>) {
    if (!order) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<{ order: Order; payment: Payment }>>(
        `/orders/${order.id}/payment`,
        payload,
        { headers: { "Idempotency-Key": idempotencyKey } }
      );
      setOrder(res.data.order);
      setPayment(res.data.payment);
      clear();
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Le paiement a échoué. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-12">
      <h1 className="mb-2 font-headline-xl text-headline-xl text-on-surface">Checkout</h1>

      <ol className="mb-8 flex gap-4">
        {STEPS.map((s, i) => {
          const currentIndex = STEPS.findIndex((x) => x.key === step);
          const isActive = s.key === step;
          const isDone = i < currentIndex;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-label-sm text-label-sm ${
                  isActive
                    ? "bg-primary text-on-primary"
                    : isDone
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {i + 1}
              </span>
              <span className={`font-label-sm text-label-sm ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {step === "delivery" && (
        <div className="space-y-space-lg">
          <FulfillmentChoice value={fulfillment} onChange={setFulfillment} storeSettings={storeSettings} />
          <Button onClick={handleCreateOrder} loading={loading} className="w-full">
            Continuer vers le paiement
          </Button>
        </div>
      )}

      {step === "payment" && order && (
        <div className="space-y-space-lg">
          <OrderSummary subtotal={Number(order.subtotal)} deliveryFee={Number(order.deliveryFee)} total={Number(order.total)} />
          <PaymentMethodForm amount={Number(order.total)} loading={loading} onSubmit={handlePay} />
          <button
            type="button"
            onClick={handleBackToDelivery}
            className="w-full text-center font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
          >
            ← Modifier le mode de réception
          </button>
        </div>
      )}

      {step === "confirmation" && order && payment && (
        <div className="space-y-space-md rounded-3xl border border-surface-container bg-surface-container-lowest p-8 text-center">
          <span className="material-symbols-outlined text-[56px] text-green-600">check_circle</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Paiement réussi</h2>
          <p className="font-body-md text-on-surface-variant">Merci pour votre commande.</p>

          <div className="mx-auto max-w-xs space-y-1 rounded-2xl bg-surface-container-low p-4 text-left font-body-sm text-body-sm">
            <div className="flex justify-between"><span>Montant payé</span><strong>{formatPrice(payment.amount)}</strong></div>
            <div className="flex justify-between"><span>Méthode</span><span>{paymentMethodLabels[payment.method]}</span></div>
            <div className="flex justify-between"><span>Référence</span><span>{payment.transactionReference}</span></div>
            <div className="flex justify-between"><span>Commande</span><span>#{order.id.slice(0, 8).toUpperCase()}</span></div>
          </div>

          <p className="font-body-sm text-body-sm text-amber-700">
            Simulation de paiement — aucun montant réel n'a été débité.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`/commandes/${order.id}`}>
              <Button variant="outline">Voir ma commande</Button>
            </Link>
            <Link href="/produits">
              <Button>Continuer mes achats</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
