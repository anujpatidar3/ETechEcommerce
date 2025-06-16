export interface CartContextType {
  items: CartItemWithProduct[];
  addItem: (productId: number, quantity?: number) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

export interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  sessionId: string;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    brand: string;
  };
}

export interface ProductFilters {
  categoryId?: number;
  featured?: boolean;
  search?: string;
  priceRange?: string;
  brand?: string;
}
