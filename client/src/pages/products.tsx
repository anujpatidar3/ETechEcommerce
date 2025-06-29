import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "../lib/schema";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import ProductCard from "../components/product/product-card";
import ProductFilters from "../components/product/product-filters";
import { Skeleton } from "../components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "../lib/queryClient";

export default function Products() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage] = useState(1);
  const productsPerPage = 12;

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const urlFilters: any = {};
    if (params.get('search')) urlFilters.search = params.get('search');
    if (params.get('category')) urlFilters.category = params.get('category');
    setFilters(urlFilters);
  }, [location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filters, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      const response = await apiRequest("GET", `/api/products?${params.toString()}`);
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const filteredProducts = products.filter(product => {
    // Apply price range filter
    if (filters.priceRange) {
      const price = parseFloat(product.price);
      switch (filters.priceRange) {
        case 'under-25':
          if (price >= 2500) return false;
          break;
        case '25-100':
          if (price < 2500 || price > 10000) return false;
          break;
        case '100-500':
          if (price < 10000 || price > 50000)
          break;
        case 'over-500':
          if (price <= 50000)
          break;
      }
    }
    // Apply brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) return false;
    }
    // Apply category filter
    if (filters.category) {
      const category = categories.find(c => c.slug === filters.category);
      if (category && product.categoryId !== category.id) return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
      case 'rating':
        return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
      default:
        return b.featured ? 1 : -1;
    }
  });

  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
          />
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">
                Showing {paginatedProducts.length} of {sortedProducts.length} products
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
            
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
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
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
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
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button variant="ghost" size="sm" className="w-10 h-10">
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
