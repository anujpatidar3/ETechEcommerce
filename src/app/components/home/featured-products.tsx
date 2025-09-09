"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice?: string;
  brand: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  imageUrl: string;
  rating: string;
  inStock: boolean;
  featured: boolean;
}

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products?featured=true");
        const products = await response.json();
        setFeaturedProducts(products.slice(0, 6)); // Show only 6 products
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Discover our most popular and trusted products
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-300" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-6 bg-gray-300 rounded w-1/3" />
                  <div className="h-8 bg-gray-300 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600">
            Discover our most popular and trusted products
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => {
            const hasDiscount =
              product.originalPrice &&
              parseFloat(product.originalPrice) > parseFloat(product.price);

            return (
              <Link key={product._id} href={`/products/${product.slug}`}>
                <div className="product-card bg-white overflow-hidden cursor-pointer h-full rounded-lg shadow-lg">
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                        Sale
                      </span>
                    )}
                    {product.featured && (
                      <span className="absolute top-2 left-2 bg-primary text-white px-2 py-1 text-xs font-semibold rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {product.brand}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-primary">
                          ₹{product.price}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span
                        className={`text-sm font-medium ${
                          product.inStock ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
