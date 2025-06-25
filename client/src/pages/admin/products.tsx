import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product, Category } from "@shared/schema";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";

export default function AdminProducts() {
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    brand: "",
    categoryId: "",
    imageUrl: "",
    rating: "0",
    inStock: true,
    featured: false,
    specifications: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.accessLevel !== 'Admin') {
      navigate('/');
      return;
    }
  }, [navigate]);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/admin/products", productData);
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Product created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/products/${id}`, data);
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/products/${id}`);
      if (!response.ok) throw new Error("Failed to delete product");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      originalPrice: "",
      brand: "",
      categoryId: "",
      imageUrl: "",
      rating: "0",
      inStock: true,
      featured: false,
      specifications: "",
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      originalPrice: product.originalPrice || "",
      brand: product.brand,
      categoryId: product.categoryId.toString(),
      imageUrl: product.imageUrl,
      rating: product.rating || "0",
      inStock: product.inStock || false,
      featured: product.featured || false,
      specifications: product.specifications || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
    };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id.toString(), data: dataToSend });
    } else {
      createProductMutation.mutate(dataToSend);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
              <Button onClick={() => navigate('/admin/brands')} variant="outline" className="w-full sm:w-auto">
                View Brands
              </Button>
              <Button onClick={() => navigate('/admin/queries')} variant="outline" className="w-full sm:w-auto">
                View Inquiries
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold">Products ({products.length})</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingProduct(null); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Select
                        value={formData.brand}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand: any) => (
                            <SelectItem key={brand.id} value={brand.name}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="specifications">Specifications (JSON)</Label>
                    <Textarea
                      id="specifications"
                      value={formData.specifications}
                      onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                      placeholder='{"voltage": "240V", "current": "16A"}'
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="inStock"
                        checked={formData.inStock}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                      />
                      <Label htmlFor="inStock">In Stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {productsLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                    <div className="flex flex-col sm:flex-row sm:space-x-4 w-full flex-1">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg mb-2 sm:mb-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold">{product.name}</h3>
                        <p className="text-gray-600 mb-2">{product.brand}</p>
                        <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="text-base sm:text-lg font-bold text-primary">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                          <span className="text-sm text-yellow-600">★ {product.rating}</span>
                          <span className={`text-sm px-2 py-1 rounded ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> 
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          {product.featured && (
                            <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">Featured</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteProductMutation.mutate(product.id.toString())}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}