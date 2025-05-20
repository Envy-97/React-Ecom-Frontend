
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string; // Still useful as a fallback or if backend doesn't provide imageData
  stock: number;
  category?: string; // Optional category
  aiHint?: string; // Optional hint for AI image generation/selection
  imageName?: string; // From backend if image is embedded
  imageType?: string; // MIME type from backend if image is embedded
  imageData?: string; // Base64 encoded image data from backend
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
