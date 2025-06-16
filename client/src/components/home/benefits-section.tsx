import { Truck, Award, Users, DollarSign } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Same-day delivery available for orders placed before 2 PM",
    },
    {
      icon: Award,
      title: "Quality Guaranteed",
      description: "All products come with manufacturer warranty and our quality promise",
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Our technical team provides professional advice and support",
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description: "Competitive pricing with bulk discounts for contractors and retailers",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose E-Tech Enterprises?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trusted by professionals and homeowners across the region for quality, reliability, and exceptional service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
