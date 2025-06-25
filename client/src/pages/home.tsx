import { useQuery } from "@tanstack/react-query";
import { Product } from "../../../shared/schema";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import HeroSection from "../components/home/hero-section";
import CategorySection from "../components/home/category-section";
import BenefitsSection from "../components/home/benefits-section";
import ContactSection from "../components/home/contact-section";
import ProductCard from "../components/product/product-card";
import { Skeleton } from "../components/ui/skeleton";

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <HeroSection />
        <CategorySection />
        
        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Products</h2>
              <p className="text-gray-600">Discover our most popular and trusted products</p>
            </div>
            
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
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
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
        
        <BenefitsSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
}
