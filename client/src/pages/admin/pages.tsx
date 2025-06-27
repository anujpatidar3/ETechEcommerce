import Header from "../../components/layout/header";
import { Button } from "../../components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { LogOut } from "lucide-react";

export default function AdminPages() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await apiRequest("POST", "/api/auth/logout");
      
      if (response.ok) {
        // Clear user info from localStorage
        localStorage.removeItem('user');
        
        toast({
          title: "Logged out successfully",
          description: "See you next time!",
        });
        
        // Redirect to home page
        navigate("/");
      } else {
        toast({
          title: "Logout failed",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-12 flex flex-col items-center gap-8">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold mb-4">Admin Pages</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button className="w-full" onClick={() => navigate("/admin/products")}>Admin Products</Button>
          <Button className="w-full" onClick={() => navigate("/admin/brands")}>Admin Brands</Button>
          <Button className="w-full" onClick={() => navigate("/admin/queries")}>Admin Inquiries</Button>
        </div>
      </div>
    </>
  );
}
