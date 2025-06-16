import { Link } from "wouter";
import { Bolt, Facebook, Twitter, Linkedin, Instagram, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-4 flex items-center">
              <Bolt className="w-8 h-8 mr-2 text-primary" />
              E-Tech Enterprises
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted partner for electrical and sanitary solutions. Serving professionals and homeowners since 2003.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-gray-300 hover:text-primary transition-colors">
                  Our Brands
                </Link>
              </li>
              <li>
                <Link href="/bulk-orders" className="text-gray-300 hover:text-primary transition-colors">
                  Bulk Orders
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-primary transition-colors">
                  Installation Services
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-primary transition-colors">
                  Technical Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=electrical" className="text-gray-300 hover:text-primary transition-colors">
                  Electrical Switches
                </Link>
              </li>
              <li>
                <Link href="/products?category=electrical" className="text-gray-300 hover:text-primary transition-colors">
                  LED Lighting
                </Link>
              </li>
              <li>
                <Link href="/products?category=sanitary" className="text-gray-300 hover:text-primary transition-colors">
                  Kitchen Faucets
                </Link>
              </li>
              <li>
                <Link href="/products?category=sanitary" className="text-gray-300 hover:text-primary transition-colors">
                  Bathroom Fittings
                </Link>
              </li>
              <li>
                <Link href="/products?category=sanitary" className="text-gray-300 hover:text-primary transition-colors">
                  Pipes & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mt-1 mr-3 text-primary flex-shrink-0" />
                <span className="text-gray-300">
                  123 Industrial Ave<br />
                  Business District<br />
                  City, State 12345
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-primary" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-primary" />
                <span className="text-gray-300">sales@etechenterprises.com</span>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 mt-1 mr-3 text-primary flex-shrink-0" />
                <span className="text-gray-300">
                  Mon-Fri: 8AM-6PM<br />
                  Sat: 9AM-4PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            &copy; 2024 E-Tech Enterprises. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-300 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-300 hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/returns" className="text-gray-300 hover:text-primary text-sm transition-colors">
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
