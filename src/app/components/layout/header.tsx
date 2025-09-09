"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Phone, Mail, Bolt, LogIn, User, LogOut } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };

    checkUser();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAdmin = user?.accessLevel === "Admin";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
  ];

  const adminLinks = [{ href: "/admin/dashboard", label: "Admin Dashboard" }];

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
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-primary mr-8 flex items-center"
            >
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
                    pathname === link.href ? "text-primary" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Login/User Button */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Welcome, {user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-2 nav-link font-medium hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {[...navLinks, ...(isAdmin ? adminLinks : [])].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link font-medium py-2 ${
                    pathname === link.href ? "text-primary" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                      <User className="w-4 h-4" />
                      <span>Welcome, {user.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors w-full text-left py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 nav-link font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
