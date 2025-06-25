import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import Login from "./pages/login";
import AdminProducts from "./pages/admin/products";
import AdminBrands from "./pages/admin/brands";
import AdminQueries from "./pages/admin/queries";
import AdminPages from "./pages/admin/pages";
import Signup from "./pages/signup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/brands" component={AdminBrands} />
      <Route path="/admin/queries" component={AdminQueries} />
      <Route path="/admin/pages" component={AdminPages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
