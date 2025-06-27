import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Phone, Mail, Bolt, LogIn, User } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";

export default function Header() {
  const [location, navigate] = useLocation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, [location]);

  const isAdmin = user && user.accessLevel === 'Admin';

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
  ];

  const adminLinks = [
    { href: "/admin/pages", label: "Admin Pages" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="border-b border-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                +91 9826643210
              </span>
              <span className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                enterprisesetech@gmail.com
              </span>
            </div>
            {/* <div className="hidden md:flex items-center space-x-4">
              <Link href="/b2b" className="nav-link hover:text-primary">
                B2B Portal
              </Link>
              <Link href="/track" className="nav-link hover:text-primary">
                Track Order
              </Link>
              <Link href="/support" className="nav-link hover:text-primary">
                Support
              </Link>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary mr-8 flex items-center">
              <Bolt className="w-8 h-8 mr-2" />
              E-Tech Enterprises
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {[...navLinks, ...(isAdmin ? adminLinks : [])].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link font-medium ${
                    location === link.href ? "text-primary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search and Cart */}
          <div className="flex items-center space-x-4">
            {/* Login/User Button */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {user.username}</span>
              </div>
            ) : (
              <button 
                className="hidden lg:flex items-center gap-2 nav-link font-medium hover:text-primary transition-colors"
                onClick={() => navigate("/login")}
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate to different sections</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  {[...navLinks, ...(isAdmin ? adminLinks : [])].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`nav-link font-medium py-2 ${
                        location === link.href ? "text-primary" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Mobile Login/User Info */}
                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                        <User className="w-4 h-4" />
                        <span>Welcome, {user.username}</span>
                      </div>
                    ) : (
                      <button 
                        className="w-full flex items-center gap-2 nav-link font-medium py-2 hover:text-primary transition-colors text-left"
                        onClick={() => navigate("/login")}
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
