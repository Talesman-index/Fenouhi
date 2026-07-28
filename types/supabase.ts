export type AccountType = "individual" | "reseller" | "business";

export type UserRole = "customer" | "agent" | "logistics" | "partner" | "admin" | "super_admin";

export type UserStatus = "active" | "suspended" | "pending_verification";

export type QuoteStatus = "new" | "under_review" | "quote_sent" | "accepted" | "rejected" | "expired";

export type OrderStatus = 
  | "pending_payment"
  | "confirmed"
  | "processing"
  | "product_purchased"
  | "received_in_china"
  | "ready_to_ship"
  | "shipped"
  | "customs_clearance"
  | "available_for_pickup"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded" | "partially_refunded";

export type ShippingMode = "air" | "sea";

export type PartnerType = "supplier" | "shipping_partner" | "agent" | "warehouse" | "freight_forwarder";

export type DisputePriority = "low" | "medium" | "high" | "urgent";

export type DisputeStatus = "open" | "in_progress" | "waiting_for_customer" | "resolved" | "closed";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  account_type: AccountType;
  role: UserRole;
  status?: UserStatus;
  avatar_url: string | null;
  last_activity?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  user_id: string | null;
  user_name?: string | null;
  user_email?: string | null;
  product_link: string;
  product_name: string;
  quantity: number;
  estimated_price: number;
  estimated_weight: number;
  shipping_mode: ShippingMode;
  destination_country: string;
  destination_city: string;
  status: QuoteStatus;
  product_cost: number;
  service_fee: number;
  shipping_fee: number;
  extra_fee: number;
  total_amount: number;
  expiration_date?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  partner_type: PartnerType;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country: string;
  city?: string | null;
  category?: string | null;
  is_verified?: boolean;
  services?: string | null;
  reliability_rating?: number;
  rating?: number;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  quote_id?: string | null;
  user_id: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_mode: ShippingMode;
  destination_country: string;
  destination_city: string;
  tracking_number?: string | null;
  assigned_agent_id?: string | null;
  supplier_id?: string | null;
  partner_id?: string | null;
  supplier_ref?: string | null;
  invoice_url?: string | null;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_url?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  shipping_mode: ShippingMode;
  weight: number;
  volume: number;
  destination_country: string;
  destination_city: string;
  departure_date?: string | null;
  estimated_arrival?: string | null;
  current_location?: string | null;
  status: string;
  proof_of_delivery_url?: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  location: string;
  description: string;
  status?: string | null;
  event_time: string;
  created_at: string;
}

export interface Payment {
  id: string;
  payment_ref: string;
  user_id: string;
  order_id?: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  status: PaymentStatus;
  proof_of_payment_url?: string | null;
  admin_note?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
  profile?: Profile;
}

export interface Dispute {
  id: string;
  ticket_number: string;
  user_id: string;
  order_id?: string | null;
  subject: string;
  description: string;
  priority: DisputePriority;
  status: DisputeStatus;
  assigned_agent_id?: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
  profile?: Profile;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id?: string | null;
  sender_name?: string | null;
  message: string;
  attachments?: string[] | null;
  is_internal_note: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  recipient_type: string;
  user_id?: string | null;
  is_read: boolean;
  channel?: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id?: string | null;
  admin_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  created_at: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  description?: string | null;
  updated_at: string;
}

export interface ContentPage {
  id: string;
  type: string;
  key: string;
  title: string;
  content: any;
  is_active: boolean;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      quotes: { Row: Quote; Insert: Partial<Quote>; Update: Partial<Quote> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      shipments: { Row: Shipment; Insert: Partial<Shipment>; Update: Partial<Shipment> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
      disputes: { Row: Dispute; Insert: Partial<Dispute>; Update: Partial<Dispute> };
      suppliers: { Row: Supplier; Insert: Partial<Supplier>; Update: Partial<Supplier> };
    };
  };
};
