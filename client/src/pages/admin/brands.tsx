import Header from "../../components/layout/header";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "../../components/ui/input";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [newBrand, setNewBrand] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [, navigate] = useLocation();

  const { data: brands = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/brands"],
  });

  const addBrandMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/admin/brands", { name });
      if (!res.ok) throw new Error("Failed to add brand");
      return res.json();
    },
    onSuccess: () => {
      setNewBrand("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest("PUT", `/api/admin/brands/${id}`, { name });
      if (!res.ok) throw new Error("Failed to update brand");
      return res.json();
    },
    onSuccess: () => {
      setEditId(null);
      setEditName("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/brands/${id}`);
      if (!res.ok) throw new Error("Failed to delete brand");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/brands"] });
    },
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand Management</h1>
              <p className="text-gray-600">Manage your brands</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
              <Button onClick={() => navigate('/admin/pages')} variant="outline" className="w-full sm:w-auto">
                Back to Admin Pages
              </Button>
              <Button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} variant="outline" className="w-full sm:w-auto">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold">Brands ({brands.length})</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (newBrand.trim()) addBrandMutation.mutate(newBrand.trim());
              }}
              className="flex gap-2"
            >
              <Input
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                placeholder="Add new brand"
                required
                className="max-w-xs"
              />
              <Button type="submit" disabled={addBrandMutation.isPending}>
                Add
              </Button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
                ) : brands.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4">No brands found.</td></tr>
                ) : (
                  (brands as any[]).map((brand: any) => (
                    <tr key={brand.id}>
                      <td className="px-4 py-2 border text-center">{brand.id}</td>
                      <td className="px-4 py-2 border text-center">
                        {editId === brand.id ? (
                          <Input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-40 mx-auto"
                          />
                        ) : (
                          brand.name
                        )}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {editId === brand.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBrandMutation.mutate({ id: brand.id, name: editName })}
                              disabled={updateBrandMutation.isPending}
                              className="mr-2"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditId(null);
                                setEditName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="mr-2" onClick={() => { setEditId(brand.id); setEditName(brand.name); }}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteBrandMutation.mutate(brand.id)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
