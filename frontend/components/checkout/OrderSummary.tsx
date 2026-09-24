import { formatPrice } from "@/lib/format";

interface Props {
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function OrderSummary({ subtotal, deliveryFee, total }: Props) {
  return (
    <div className="space-y-2 rounded-2xl border border-surface-container bg-surface-container-lowest p-5">
      <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
        <span>Sous-total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
        <span>Livraison</span>
        <span>{deliveryFee === 0 ? "Gratuit" : formatPrice(deliveryFee)}</span>
      </div>
      <div className="flex justify-between border-t border-surface-container pt-2 font-price-lg text-price-lg text-on-surface">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
