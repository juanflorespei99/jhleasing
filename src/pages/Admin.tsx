import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import VehicleTable from "@/components/admin/VehicleTable";
import VehicleForm from "@/components/admin/VehicleForm";
import MarkAsSoldDialog from "@/components/admin/MarkAsSoldDialog";
import SalesDashboard from "@/components/admin/SalesDashboard";
import BulkUploadDialog from "@/components/admin/BulkUploadDialog";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Car, Search, BadgeDollarSign, Users, Download, Upload, Globe } from "lucide-react";
import { downloadVehicleTemplate } from "@/lib/vehicleExcel";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-jhl-icon.png";
import type { VehicleAdminRow } from "@/types/vehicle";
import UserManagement from "@/components/admin/UserManagement";
import DomainManagement from "@/components/admin/DomainManagement";

function AdminDashboard() {
  const { signOut } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleAdminRow | null>(null);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [soldVehicle, setSoldVehicle] = useState<VehicleAdminRow | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(`Error cargando inventario: ${error.message}`);
    } else {
      setVehicles((data ?? []) as VehicleAdminRow[]);
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
      toast.success("Vehículo eliminado permanentemente");
      fetchVehicles();
    }
  };

  const handleMarkAvailable = async (v: VehicleAdminRow) => {
    const { error } = await supabase
      .from("vehicles")
      .update({
        sold_at: null,
        sold_price: null,
        buyer_name: "",
        sale_notes: "",
        status: "Disponible",
        is_active: true,
      })
      .eq("id", v.id);
    if (error) {
      toast.error("Error regresando vehículo al catálogo");
    } else {
      toast.success(`${v.brand} ${v.name} regresado al catálogo`);
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
    <div className="min-h-screen bg-background">
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
        <Tabs defaultValue="inventory" className="space-y-5">
          {/* Compact header row: stats + tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Inline stats */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-foreground/5 rounded-full px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total</span>
                  <span className="text-sm font-bold text-foreground">{stats.total}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-green-500/10 rounded-full px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-green-700 font-medium">Activos</span>
                  <span className="text-sm font-bold text-green-700">{stats.active}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Públicos</span>
                  <span className="text-sm font-bold text-primary">{stats.public}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-500/10 rounded-full px-3 py-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-blue-700 font-medium">Exclusivos</span>
                  <span className="text-sm font-bold text-blue-700">{stats.exclusive}</span>
                </div>
              </div>

              {/* Tabs */}
              <TabsList className="bg-foreground/5 rounded-full p-1 h-auto self-start">
                <TabsTrigger value="inventory" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Inventario
                </TabsTrigger>
                <TabsTrigger value="sales" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none gap-1.5">
                  <BadgeDollarSign className="h-3.5 w-3.5" />
                  Ventas
                  {stats.sold > 0 && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{stats.sold}</span>}
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Usuarios
                </TabsTrigger>
                <TabsTrigger value="domains" className="rounded-full text-xs px-4 py-1.5 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Dominios
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="inventory" className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, marca, serial..."
                  className="pl-9 rounded-full"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => void downloadVehicleTemplate()}
                  className="rounded-full"
                  title="Descargar plantilla Excel vacía"
                >
                  <Download className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Plantilla</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBulkUploadOpen(true)}
                  className="rounded-full"
                  title="Subir plantilla llena con varios vehículos"
                >
                  <Upload className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Carga masiva</span>
                </Button>
                <Button onClick={handleNew} className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" /> Nuevo Vehículo
                </Button>
              </div>
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
                onMarkAvailable={handleMarkAvailable}
              />
            )}
          </TabsContent>

          <TabsContent value="sales">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Cargando ventas...</div>
            ) : (
              <SalesDashboard vehicles={vehicles} onDelete={handleDelete} onMarkAvailable={handleMarkAvailable} />
            )}
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="domains">
            <DomainManagement />
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

      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onUploaded={fetchVehicles}
      />
    </div>
  );
}

export default function Admin() {
  // Note: route-level <AdminGuard> wraps this in App.tsx, so we don't need to
  // wrap again here. Keeping the import out avoids confusion.
  return <AdminDashboard />;
}
