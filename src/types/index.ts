
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string; // Optional category
  aiHint?: string; // Optional hint for AI image generation/selection
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'customer';
  // Add other user-specific fields if needed
}
