"use client";

import HeroSection from "./components/home/hero-section";
import CategorySection from "./components/home/category-section";
import BenefitsSection from "./components/home/benefits-section";
import ContactSection from "./components/home/contact-section";
import FeaturedProducts from "./components/home/featured-products";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <HeroSection />
        <CategorySection />
        <FeaturedProducts />
        <BenefitsSection />
        <ContactSection />
      </main>
    </div>
  );
}
