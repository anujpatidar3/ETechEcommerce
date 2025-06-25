import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
}

export default function ProductFilters({ onFiltersChange, currentFilters }: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  useEffect(() => {
    // If a category slug is present in currentFilters, select the corresponding category
    if (currentFilters.category && categories.length > 0) {
      const selected = categories.find(c => c.slug === currentFilters.category);
      if (selected) {
        setLocalFilters((prev: any) => ({
          ...prev,
          categories: [selected.id],
          category: selected.slug,
        }));
      }
    }
  }, [currentFilters.category, categories]);

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    // Allow multiple categories to be selected
    let newCategories: number[] = Array.isArray(localFilters.categories) ? [...localFilters.categories] : [];
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
    // If categories are selected, find their slugs and pass as 'category' filter (array of slugs)
    console.log("Applying filters:", localFilters);
    let filtersToSend = { ...localFilters };
    if (localFilters.categories && localFilters.categories.length > 0 && categories.length > 0) {
      const selectedCategories = categories.filter(c => localFilters.categories.includes(c.id));
      if (selectedCategories.length > 0) {
        filtersToSend = { ...filtersToSend, category: selectedCategories.map(c => c.slug) };
      }
    } else {
      filtersToSend.category = []; // Clear category if no categories selected
    }
    onFiltersChange(filtersToSend);
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
                  checked={(localFilters.categories || []).includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
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
            {(brands as any[]).map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.name}`}
                  checked={(localFilters.brands || []).includes(brand.name)}
                  onCheckedChange={(checked) => handleBrandChange(brand.name, checked as boolean)}
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
