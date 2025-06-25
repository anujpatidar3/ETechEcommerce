import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bolt } from "lucide-react";

export default function Signup() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "You can now log in.",
        });
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration failed",
          description: errorData.message || "Could not register user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Bolt className="w-12 h-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Signup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            E-Tech Enterprises Admin Panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>
              <div className="text-center text-sm mt-2">
                Already have an account?{' '}
                <span
                  className="text-primary cursor-pointer underline"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
