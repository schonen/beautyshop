import { OrderStatus } from "@/types";
import { orderStatusLabels, orderStatusColors } from "@/lib/format";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusColors[status]}`}>
      {orderStatusLabels[status]}
    </span>
  );
}
