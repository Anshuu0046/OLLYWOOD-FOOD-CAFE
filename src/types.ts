export type FoodType = 'Veg' | 'Non-Veg';

export type MenuCategoryType =
  | 'biryani'
  | 'mutton'
  | 'prawn'
  | 'fish'
  | 'chicken'
  | 'starters-nonveg'
  | 'starters-veg'
  | 'mains-veg'
  | 'rice-roti'
  | 'noodles-chopsuey'
  | 'pizza-burger'
  | 'pasta-maggie'
  | 'soups'
  | 'combos'
  | 'hot-beverages'
  | 'desserts'
  | 'beverages';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  type: FoodType;
  category: MenuCategoryType;
  subCategory?: string;
  desc: string;
  rating: number;
  image?: string;
  isChefSpecial?: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  type: FoodType;
  quantity: number;
  specialInstructions?: string;
  portion?: string;
}

export interface OfferCoupon {
  code: string;
  title: string;
  description: string;
  tag: string;
  discountType: 'flat' | 'percent' | 'freebie';
  discountValue: number;
  minOrder?: number;
}

export interface GalleryItem {
  id: number;
  title: string;
  image: string;
  alt: string;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Served' | 'Settled' | 'Cancelled';

export interface OrderDetails {
  orderId: string;
  kotNumber: number;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: 'UPI' | 'Cash' | 'Card' | 'Pay at Cashier Desk';
  paymentStatus?: 'Unpaid' | 'Paid';
  instructions?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxes: number;
  deliveryFee?: number;
  total: number;
  status: OrderStatus;
  createdAt: Date | string;
  isDineIn: boolean;
  automatedReceiptDispatched?: boolean;
  whatsappDeliveryStatus?: string;
  emailDeliveryStatus?: string;
}

export interface PosIntegrationConfig {
  systemName: string;
  autoChimeEnabled: boolean;
  kdsEnabled: boolean;
  webhookEnabled: boolean;
  webhookUrl: string;
  webhookAuthHeader?: string;
  networkPrinterEnabled: boolean;
  networkPrinterIp: string;
  networkPrinterPort: number;
  whatsappReceiptEnabled: boolean;
  autoWhatsappBill?: boolean;
  autoEmailBill?: boolean;
  whatsappGatewayUrl?: string;
  whatsappApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  autoPrintKot: boolean;
}

export interface PosDispatchLog {
  id: string;
  timestamp: string;
  type: 'KDS_TERMINAL' | 'EXTERNAL_WEBHOOK' | 'ESC_POS_PRINTER' | 'WHATSAPP_DISPATCH' | 'WHATSAPP_AUTO' | 'EMAIL_AUTO';
  orderId: string;
  kotNumber: number;
  tableNumber: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'DISPATCHED' | 'AUTOMATED';
  message: string;
}
