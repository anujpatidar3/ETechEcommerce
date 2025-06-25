import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AdminPages() {
  const [, navigate] = useLocation();
  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto mt-12 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold mb-4">Admin Pages</h1>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button className="w-full" onClick={() => navigate("/admin/products")}>Admin Products</Button>
          <Button className="w-full" onClick={() => navigate("/admin/brands")}>Admin Brands</Button>
          <Button className="w-full" onClick={() => navigate("/admin/queries")}>Admin Inquiries</Button>
        </div>
      </div>
    </>
  );
}
