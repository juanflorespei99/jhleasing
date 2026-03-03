import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminGuard from "@/components/admin/AdminGuard";
import VehicleTable, { type VehicleRow } from "@/components/admin/VehicleTable";
import VehicleForm from "@/components/admin/VehicleForm";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Car } from "lucide-react";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-jhl-icon.png";

function AdminDashboard() {
  const { signOut } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);

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
      setVehicles((data as unknown as VehicleRow[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleEdit = (v: VehicleRow) => {
    setEditVehicle(v);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditVehicle(null);
    setFormOpen(true);
  };

  const handleToggleActive = async (v: VehicleRow) => {
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

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.is_active).length,
    public: vehicles.filter(v => v.is_public && v.is_active).length,
    exclusive: vehicles.filter(v => !v.is_public && v.is_active).length,
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-border/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="JHL" className="h-8 w-auto" />
            <h1 className="text-lg font-bold text-foreground">Panel de Administración</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Catálogo</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>Cerrar sesión</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: Car },
            { label: "Activos", value: stats.active, color: "text-green-600" },
            { label: "Públicos", value: stats.public, color: "text-primary" },
            { label: "Exclusivos", value: stats.exclusive, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="neu-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={cn("text-3xl font-bold mt-1", s.color || "text-foreground")}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Inventario</h2>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-1" /> Nuevo Vehículo
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Cargando inventario...</div>
        ) : (
          <VehicleTable
            vehicles={vehicles}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
          />
        )}
      </main>

      <VehicleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicle={editVehicle}
        onSaved={fetchVehicles}
      />
    </div>
  );
}

// cn helper inline for stats
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Admin() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
