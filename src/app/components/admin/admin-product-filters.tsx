"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface AdminProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
  categories: Category[];
  brands: string[];
}

export default function AdminProductFilters({
  onFiltersChange,
  currentFilters,
  categories,
  brands,
}: AdminProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    let newCategories: string[] = Array.isArray(localFilters.categories)
      ? [...localFilters.categories]
      : [];
    if (checked) {
      if (!newCategories.includes(categoryId)) newCategories.push(categoryId);
    } else {
      newCategories = newCategories.filter((id) => id !== categoryId);
    }
    const newFilters = { ...localFilters, categories: newCategories };
    setLocalFilters(newFilters);
  };

  const handlePriceRangeChange = (priceRange: string) => {
    const newFilters = { ...localFilters, priceRange };
    setLocalFilters(newFilters);
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...(localFilters.brands || []), brand]
      : (localFilters.brands || []).filter((b: string) => b !== brand);

    const newFilters = { ...localFilters, brands: newBrands };
    setLocalFilters(newFilters);
  };

  const handleStockStatusChange = (status: string) => {
    const newFilters = { ...localFilters, stockStatus: status };
    setLocalFilters(newFilters);
  };

  const handleFeaturedChange = (featured: string) => {
    const newFilters = { ...localFilters, featured };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card className="w-full lg:w-80 h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Product Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Filter */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Search</h4>
          <Input
            type="text"
            placeholder="Search products..."
            value={localFilters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Category</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category._id}`}
                  checked={(localFilters.categories || []).includes(
                    category._id
                  )}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category._id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category._id}`}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
          <RadioGroup
            value={localFilters.priceRange || ""}
            onValueChange={handlePriceRangeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="under-25" id="under-25" />
              <Label htmlFor="under-25" className="text-sm text-gray-600">
                Under ₹2,500
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="25-100" id="25-100" />
              <Label htmlFor="25-100" className="text-sm text-gray-600">
                ₹2,500 - ₹10,000
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="100-500" id="100-500" />
              <Label htmlFor="100-500" className="text-sm text-gray-600">
                ₹10,000 - ₹50,000
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="over-500" id="over-500" />
              <Label htmlFor="over-500" className="text-sm text-gray-600">
                Over ₹50,000
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Brand Filter */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Brand</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={(localFilters.brands || []).includes(brand)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stock Status */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Stock Status</h4>
          <RadioGroup
            value={localFilters.stockStatus || ""}
            onValueChange={handleStockStatusChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in-stock" id="in-stock" />
              <Label htmlFor="in-stock" className="text-sm text-gray-600">
                In Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="out-of-stock" id="out-of-stock" />
              <Label htmlFor="out-of-stock" className="text-sm text-gray-600">
                Out of Stock
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        {/* Featured Status */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Featured</h4>
          <RadioGroup
            value={localFilters.featured || ""}
            onValueChange={handleFeaturedChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="featured" id="featured" />
              <Label htmlFor="featured" className="text-sm text-gray-600">
                Featured
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-featured" id="not-featured" />
              <Label htmlFor="not-featured" className="text-sm text-gray-600">
                Not Featured
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="flex flex-col space-y-2">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
