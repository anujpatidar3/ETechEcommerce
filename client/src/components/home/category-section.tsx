import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Bolt, Droplets, ArrowRight } from "lucide-react";

export default function CategorySection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Product Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive range of electrical and sanitary products for residential, commercial, and industrial applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Electrical Category */}
          <Link href="/products?category=electrical">
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300">
              <div className="overflow-hidden rounded-t-lg">
                <img
                  src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Electrical products including switches and wires"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Bolt className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Electrical Products</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Switches, wires, circuit breakers, LED lights, outlets, and complete electrical solutions for every project.
                </p>
                <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Electrical <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Sanitary Category */}
          <Link href="/products?category=sanitary">
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300">
              <div className="overflow-hidden rounded-t-lg">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
                  alt="Sanitary products including faucets and fixtures"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Sanitary Products</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Faucets, pipes, bathroom fittings, kitchen sinks, and complete plumbing solutions for modern spaces.
                </p>
                <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Sanitary <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
