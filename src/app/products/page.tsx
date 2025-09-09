"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../components/product/product-card";
import AdminProductFilters from "../components/admin/admin-product-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

interface Product {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  originalPrice?: string;
  brand: string;
  categoryId: string;
  imageUrl: string;
  rating?: string;
  inStock: boolean;
  featured: boolean;
  createdAt?: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  _id: string;
  id: string;
  name: string;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const productsPerPage = 12;

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters: any = {};
    if (params.get("search")) urlFilters.search = params.get("search");
    if (params.get("category")) urlFilters.category = params.get("category");
    setFilters(urlFilters);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        // Transform data to match client structure
        const transformedProducts = productsData.map((p: any) => ({
          ...p,
          id: p._id,
          categoryId: p.categoryId?._id || p.categoryId,
        }));
        setProducts(transformedProducts);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        const transformedCategories = categoriesData.map((c: any) => ({
          ...c,
          id: c._id,
        }));
        setCategories(transformedCategories);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        const transformedBrands = brandsData.map((b: any) => ({
          ...b,
          id: b._id,
        }));
        setBrands(transformedBrands);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (
        !product.name.toLowerCase().includes(searchTerm) &&
        !product.brand.toLowerCase().includes(searchTerm) &&
        !(product.description || "").toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(product.categoryId)) {
        return false;
      }
    }

    // Apply brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) {
        return false;
      }
    }

    // Apply price range filter
    if (filters.priceRange) {
      const price = parseFloat(product.price);
      switch (filters.priceRange) {
        case "under-25":
          if (price >= 2500) return false;
          break;
        case "25-100":
          if (price < 2500 || price > 10000) return false;
          break;
        case "100-500":
          if (price < 10000 || price > 50000) return false;
          break;
        case "over-500":
          if (price <= 50000) return false;
          break;
      }
    }

    // Apply stock status filter
    if (filters.stockStatus) {
      if (filters.stockStatus === "in-stock" && !product.inStock) return false;
      if (filters.stockStatus === "out-of-stock" && product.inStock)
        return false;
    }

    // Apply featured status filter
    if (filters.featured) {
      if (filters.featured === "featured" && !product.featured) return false;
      if (filters.featured === "not-featured" && product.featured) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
        return (
          new Date(b.createdAt ?? "").getTime() -
          new Date(a.createdAt ?? "").getTime()
        );
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "featured":
      default:
        return b.featured === a.featured ? 0 : b.featured ? 1 : -1;
    }
  });

  // Paginate products
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64">
              <div className="h-96 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <Skeleton className="w-full h-48" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AdminProductFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
            categories={categories}
            brands={brands.map((b) => b.name)}
          />

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">
                Showing {paginatedProducts.length} of {sortedProducts.length}{" "}
                products
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Best Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No products found matching your criteria.
                </p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        className="w-10 h-10"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}

                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
