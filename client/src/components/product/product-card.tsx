import { Link } from "wouter";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="product-card bg-white overflow-hidden cursor-pointer h-full">
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-primary hover:bg-primary/80">
              Featured
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">
                ${product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${product.originalPrice}
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
            <Badge variant={product.inStock ? "default" : "destructive"}>
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
