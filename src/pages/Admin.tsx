import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminGuard from "@/components/admin/AdminGuard";
import VehicleTable from "@/components/admin/VehicleTable";
import VehicleForm from "@/components/admin/VehicleForm";
import MarkAsSoldDialog from "@/components/admin/MarkAsSoldDialog";
import SalesDashboard from "@/components/admin/SalesDashboard";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Car, Search, BadgeDollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-jhl-icon.png";
import type { VehicleAdminRow } from "@/types/vehicle";

function AdminDashboard() {
  const { signOut } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleAdminRow | null>(null);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [soldVehicle, setSoldVehicle] = useState<VehicleAdminRow | null>(null);
  const [search, setSearch] = useState("");

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error cargando inventario");
      console.error(error);
    } else {
      setVehicles((data as unknown as VehicleAdminRow[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleEdit = (v: VehicleAdminRow) => {
    setEditVehicle(v);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditVehicle(null);
    setFormOpen(true);
  };

  const handleMarkSold = (v: VehicleAdminRow) => {
    setSoldVehicle(v);
    setSoldDialogOpen(true);
  };

  const handleToggleActive = async (v: VehicleAdminRow) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ is_active: !v.is_active })
      .eq("id", v.id);
    if (error) toast.error("Error actualizando estado");
    else {
      toast.success(v.is_active ? "Vehículo pausado" : "Vehículo activado");
      fetchVehicles();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) toast.error("Error eliminando vehículo");
    else {
      toast.success("Vehículo eliminado");
      fetchVehicles();
    }
  };

  // Filter out sold vehicles for inventory tab
  const inventoryVehicles = vehicles.filter(v => !v.sold_at);

  const stats = {
    total: inventoryVehicles.length,
    active: inventoryVehicles.filter(v => v.is_active).length,
    public: inventoryVehicles.filter(v => v.is_public && v.is_active).length,
    exclusive: inventoryVehicles.filter(v => !v.is_public && v.is_active).length,
    sold: vehicles.filter(v => v.sold_at).length,
  };

  const filtered = inventoryVehicles.filter(v => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.type.toLowerCase().includes(q) ||
      v.vin?.toLowerCase().includes(q) ||
      v.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-border/50 px-3 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <img src={logoIcon} alt="JHL" className="h-7 md:h-8 w-auto flex-shrink-0" />
            <h1 className="text-sm md:text-lg font-bold text-foreground truncate">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Catálogo</span>
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut} className="text-xs">
              <span className="hidden sm:inline">Cerrar sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <Tabs defaultValue="inventory" className="space-y-6 md:space-y-8">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="inventory" className="flex items-center gap-1.5">
              <Car className="h-4 w-4" />
              Inventario
              <span className="text-[10px] bg-foreground/10 px-1.5 py-0.5 rounded-full">{stats.total}</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-1.5">
              <BadgeDollarSign className="h-4 w-4" />
              Ventas
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{stats.sold}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6 md:space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Total", value: stats.total, icon: Car },
                { label: "Activos", value: stats.active, color: "text-green-600" },
                { label: "Públicos", value: stats.public, color: "text-primary" },
                { label: "Exclusivos", value: stats.exclusive, color: "text-blue-600" },
              ].map(s => (
                <div key={s.label} className="neu-card p-4 md:p-5">
                  <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl md:text-3xl font-bold mt-1 ${s.color || "text-foreground"}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, marca, VIN..."
                  className="pl-9 rounded-full"
                />
              </div>
              <Button onClick={handleNew} className="rounded-full flex-shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Nuevo Vehículo
              </Button>
            </div>

            {/* Vehicle Cards */}
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Cargando inventario...</div>
            ) : (
              <VehicleTable
                vehicles={filtered}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
              />
            )}
          </TabsContent>

          <TabsContent value="sales">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Cargando ventas...</div>
            ) : (
              <SalesDashboard vehicles={vehicles} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <VehicleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicle={editVehicle}
        onSaved={fetchVehicles}
      />

      <MarkAsSoldDialog
        open={soldDialogOpen}
        onOpenChange={setSoldDialogOpen}
        vehicle={soldVehicle}
        onSaved={fetchVehicles}
      />
    </div>
  );
}

export default function Admin() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
