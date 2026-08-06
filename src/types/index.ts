export interface User {
  name: string;
  email: string;
  password?: string;
  major: string;
  batch: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  allowNego?: boolean;
  stock?: number;
  image?: string;
  images?: string[];
  seller: string;
  sellerEmail: string;
  sellerMajor?: string;
  sellerBatch?: string;
  createdAt?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Reply {
  id: string;
  senderEmail: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  sellerEmail: string;
  buyerEmail: string;
  buyerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface DirectMessage {
  id: string;
  sellerEmail: string;
  sellerName: string;
  buyerEmail: string;
  buyerName: string;
  productId: string;
  productName: string;
  productPrice: number;
  proposedPrice?: number | null;
  messageText?: string;
  type: 'nego' | 'order';
  status: 'pending' | 'accepted' | 'rejected';
  paymentMethod: string;
  createdAt: string;
  unreadBySeller: boolean;
  unreadByBuyer: boolean;
  reviewed?: boolean;
  replies: Reply[];
}
