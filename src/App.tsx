import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RecoveryRedirect from "@/components/auth/RecoveryRedirect";
import AdminGuard from "@/components/admin/AdminGuard";
import Index from "./pages/Index";
import VehicleDetail from "./pages/VehicleDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Inventory from "./pages/Inventory";
import Compare from "./pages/Compare";
import PurchaseRequest from "./pages/PurchaseRequest";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RecoveryRedirect />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vehiculo/:id" element={<VehicleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/inventario" element={<Inventory />} />
            <Route path="/comparar" element={<Compare />} />
            <Route path="/solicitar-compra/:slug" element={<PurchaseRequest />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
