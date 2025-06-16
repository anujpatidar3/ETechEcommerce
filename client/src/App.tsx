import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { CartContext } from "@/hooks/use-cart";
import { CartItemWithProduct } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Generate session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Load cart items on mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setIsLoading(true);
        const sessionId = getSessionId();
        const response = await fetch(`/api/cart/${sessionId}`);
        if (response.ok) {
          const cartItems = await response.json();
          setItems(cartItems);
        }
      } catch (error) {
        console.error('Failed to load cart items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, []);

  const addItem = async (productId: number, quantity = 1) => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();
      const response = await apiRequest('POST', '/api/cart', {
        productId,
        quantity,
        sessionId,
      });

      if (response.ok) {
        // Reload cart items
        const cartResponse = await fetch(`/api/cart/${sessionId}`);
        const cartItems = await cartResponse.json();
        setItems(cartItems);
        
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: number, quantity: number) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('PUT', `/api/cart/${id}`, { quantity });

      if (response.ok) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, quantity } : item
        ));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('DELETE', `/api/cart/${id}`);

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove cart item.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();
      const response = await apiRequest('DELETE', `/api/cart/session/${sessionId}`);

      if (response.ok) {
        setItems([]);
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      totalItems,
      totalPrice,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
