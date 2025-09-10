"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable from "../../components/ui/data-table";
import AdminProductFilters from "../../components/admin/admin-product-filters";
import ImageUpload from "../../components/ui/image-upload";
import FormInput from "../../components/ui/form-input";
import FormSelect from "../../components/ui/form-select";
import FormTextarea from "../../components/ui/form-textarea";
import { isCloudinaryUrl } from "../../../lib/image-utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  originalPrice?: string;
  brand: string;
  imageUrl: string;
  rating?: string;
  inStock: boolean;
  featured: boolean;
  specifications?: string;
  categoryId: any;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Brand {
  _id: string;
  name: string;
  createdAt?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    originalPrice: "",
    brand: "",
    categoryId: "",
    imageUrl: "",
    rating: "",
    inStock: true,
    featured: false,
    specifications: "",
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.slug.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(
          product.categoryId._id || product.categoryId
        )
      );
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        filters.brands.includes(product.brand)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter((product) => {
        const price = parseInt(product.price.replace(/,/g, ""));
        switch (filters.priceRange) {
          case "under-25":
            return price < 2500;
          case "25-100":
            return price >= 2500 && price <= 10000;
          case "100-500":
            return price > 10000 && price <= 50000;
          case "over-500":
            return price > 50000;
          default:
            return true;
        }
      });
    }

    // Stock status filter
    if (filters.stockStatus) {
      filtered = filtered.filter((product) =>
        filters.stockStatus === "in-stock" ? product.inStock : !product.inStock
      );
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter((product) =>
        filters.featured === "featured" ? product.featured : !product.featured
      );
    }

    setFilteredProducts(filtered);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/admin");
        return;
      }
      const userData = await response.json();
      if (userData.accessLevel !== "Admin") {
        router.push("/admin");
      }
    } catch (error) {
      router.push("/admin");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);

        // Extract unique brand names for filter
        const uniqueBrandNames: string[] = [];
        const seenBrands = new Set<string>();
        data.forEach((product: Product) => {
          if (!seenBrands.has(product.brand)) {
            seenBrands.add(product.brand);
            uniqueBrandNames.push(product.brand);
          }
        });
        setBrandNames(uniqueBrandNames);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.imageUrl) {
      alert("Please provide an image for the product");
      return;
    }

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct._id}`
        : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchProducts();
        resetForm();
        setIsDialogOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
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
      categoryId: product.categoryId._id || product.categoryId,
      imageUrl: product.imageUrl,
      rating: product.rating || "",
      inStock: product.inStock,
      featured: product.featured,
      specifications: product.specifications || "",
    });
    fetchBrands(); // Refresh brands when editing
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        // Find the product to get its image URL
        const product = products.find((p) => p._id === id);

        const response = await fetch(`/api/admin/products/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Delete associated image from Cloudinary if it exists
          if (product?.imageUrl && isCloudinaryUrl(product.imageUrl)) {
            try {
              await fetch(
                `/api/upload?imageUrl=${encodeURIComponent(product.imageUrl)}`,
                {
                  method: "DELETE",
                }
              );
            } catch (error) {
              console.error("Error deleting product image:", error);
              // Continue even if image deletion fails
            }
          }

          fetchProducts();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

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
      rating: "",
      inStock: true,
      featured: false,
      specifications: "",
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
      .trim();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Auto-generate slug when name changes
      if (name === "name" && !editingProduct) {
        setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
      }
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-lg object-cover"
            src={product.imageUrl}
            alt={product.name}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {product.name}
            </div>
            <div className="text-sm text-gray-500">{product.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (product: Product) => (
        <div>
          <div className="text-sm text-gray-900">₹{product.price}</div>
          {product.originalPrice && (
            <div className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "brand",
      header: "Brand",
      sortable: true,
      render: (product: Product) => (
        <span className="text-sm text-gray-900">{product.brand}</span>
      ),
    },
    {
      key: "inStock",
      header: "Status",
      sortable: true,
      render: (product: Product) => (
        <div className="flex flex-col space-y-1">
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              product.inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
          {product.featured && (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (product: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(product)}
            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(product._id)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Product Management
              </h1>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingProduct(null);
                fetchBrands(); // Refresh brands when opening the dialog
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Filters and Table Layout */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AdminProductFilters
            onFiltersChange={setFilters}
            currentFilters={filters}
            categories={categories}
            brands={brandNames}
          />

          {/* Products Table */}
          <div className="flex-1">
            <DataTable
              data={filteredProducts}
              columns={columns}
              itemsPerPage={10}
            />
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                      label="Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                    <FormInput
                      label="Slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      helperText="URL-friendly version of the product name"
                    />
                  </div>

                  <FormTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    helperText="Describe the product features and benefits"
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                      label="Price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      helperText="Current selling price in ₹"
                    />

                    <FormInput
                      label="Original Price"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      helperText="Original price (for showing discounts)"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormSelect
                      label="Brand"
                      name="brand"
                      value={formData.brand}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, brand: value }))
                      }
                      options={brands.map((brand) => ({
                        value: brand.name,
                        label: brand.name,
                        _id: brand._id,
                      }))}
                      placeholder="Select Brand"
                      required
                      emptyMessage="No brands available."
                      linkText="Manage Brands"
                      linkHref="/admin/brands"
                      linkTarget="_blank"
                      showRefresh={false}
                    />

                    <FormSelect
                      label="Category"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, categoryId: value }))
                      }
                      options={categories.map((category) => ({
                        value: category._id,
                        label: category.name,
                        _id: category._id,
                      }))}
                      placeholder="Select Category"
                      required
                      emptyMessage="No categories available."
                      linkText="Manage Categories"
                      linkHref="/admin/categories"
                      linkTarget="_blank"
                    />
                  </div>

                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) =>
                      setFormData((prev) => ({ ...prev, imageUrl: url }))
                    }
                    disabled={false}
                  />

                  <FormTextarea
                    label="Specifications"
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    rows={3}
                    helperText="Enter specifications separated by commas (e.g., Material: Plastic, Color: White)"
                  />

                  <div className="grid md:grid-cols-3 gap-4">
                    <FormInput
                      label="Rating"
                      name="rating"
                      type="number"
                      value={formData.rating}
                      onChange={handleChange}
                      min={0}
                      max={5}
                      step={0.1}
                      helperText="Rating out of 5"
                    />

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        In Stock
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Featured
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingProduct(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
