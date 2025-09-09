"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  _id: string;
  id: string;
  name: string;
}

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
  categories: Category[];
  brands: Brand[];
}

export default function ProductFilters({
  onFiltersChange,
  currentFilters,
  categories,
  brands,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

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

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card className="w-full lg:w-64 h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={(localFilters.categories || []).includes(
                    category.id
                  )}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category.id}`}
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
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.name}`}
                  checked={(localFilters.brands || []).includes(brand.name)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.name, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`brand-${brand.name}`}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
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
