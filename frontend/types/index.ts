export type Role = "CLIENT" | "ADMIN";
export type SkinType = "NORMAL" | "SEC" | "GRAS" | "MIXTE" | "TOUS";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PICKED_UP"
  | "CANCELLED";

export type FulfillmentMethod = "DELIVERY" | "PICKUP";
export type PaymentMethod = "ORANGE_MONEY" | "MTN_MOBILE_MONEY" | "CARD";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type NotificationType = "PAYMENT_SUCCESS" | "NEW_ORDER" | "ORDER_STATUS_CHANGED" | "LOW_STOCK" | "SYSTEM";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
}

export interface Product {
  id: string;
  brand?: string | null;
  name: string;
  description: string;
  price: string; // Decimal Prisma → sérialisé en string par Express/JSON
  stock: number;
  imageUrl?: string | null;
  skinType: SkinType;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  currency: string;
  transactionReference: string;
  cardLast4?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: string;
  deliveryFee: string;
  total: string;
  fulfillmentMethod: FulfillmentMethod;
  deliveryCity?: string | null;
  deliveryNeighborhood?: string | null;
  deliveryAddress?: string | null;
  deliveryNotes?: string | null;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  payment?: Payment | null;
  user?: { name: string; email: string };
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: string | null;
  paymentId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  storeCity: string;
  storeAddress: string;
  storePhone: string;
  currency: string;
  deliveryEnabled: boolean;
  minDeliveryFee: string;
  maxDeliveryFee: string;
  lowStockThreshold: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  unread?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryFulfillmentInput = {
  fulfillmentMethod: "DELIVERY";
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryNeighborhood: string;
  deliveryAddress: string;
  deliveryNotes?: string;
};

export type PickupFulfillmentInput = {
  fulfillmentMethod: "PICKUP";
  customerName: string;
  customerPhone: string;
};

export type FulfillmentInput = DeliveryFulfillmentInput | PickupFulfillmentInput;
