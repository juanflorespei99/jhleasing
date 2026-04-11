import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Pause, Play, Trash2, MapPin, Gauge, Calendar, Tag, BadgeDollarSign, RotateCcw } from "lucide-react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmtMXN } from "@/lib/format";
import type { VehicleAdminRow } from "@/types/vehicle";

interface Props {
  vehicles: VehicleAdminRow[];
  onEdit: (v: VehicleAdminRow) => void;
  onToggleActive: (v: VehicleAdminRow) => void;
  onDelete: (id: string) => void;
  onMarkSold?: (v: VehicleAdminRow) => void;
  onMarkAvailable?: (v: VehicleAdminRow) => void;
}

function getStatusBadge(v: VehicleAdminRow) {
  if (v.sold_at) return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Vendido</Badge>;
  if (!v.is_active) return <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px]">Inactivo</Badge>;
  if (!v.is_public) return <Badge className="bg-blue-500/20 text-blue-700 border-blue-300 text-[10px]">Exclusivo</Badge>;
  return <Badge className="bg-green-500/20 text-green-700 border-green-300 text-[10px]">Público</Badge>;
}

/** Delete button with "ELIMINAR" confirmation input. */
function DeleteButton({ vehicle, onDelete }: { vehicle: VehicleAdminRow; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setConfirmText("");
  };

  const handleConfirm = () => {
    onDelete(vehicle.id);
    setOpen(false);
    setConfirmText("");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Eliminar" className="h-8 w-8 rounded-full">
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar vehículo permanentemente?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Estás a punto de eliminar <strong className="text-foreground">{vehicle.brand} {vehicle.name}</strong>.
              </p>
              {vehicle.vin && (
                <p>Serial: <span className="font-mono text-foreground">{vehicle.vin}</span></p>
              )}
              <p>Esta acción <strong className="text-destructive">no se puede deshacer</strong>.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">
            Escribe <strong className="text-destructive">ELIMINAR</strong> para confirmar
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmText !== "ELIMINAR"}
          >
            Eliminar permanentemente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function VehicleTable({ vehicles, onEdit, onToggleActive, onDelete, onMarkSold, onMarkAvailable }: Props) {
  if (vehicles.length === 0) {
    return (
      <div className="neu-card p-12 text-center text-muted-foreground">
        <p className="text-lg font-light uppercase tracking-widest">No hay vehículos en el inventario</p>
        <p className="text-sm mt-2">Agrega tu primer vehículo para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicles.map((v) => {
        const margin = v.price_public - v.price_employee;
        const marginPct = v.price_public > 0 ? ((margin / v.price_public) * 100).toFixed(1) : "0";

        return (
          <div
            key={v.id}
            className={`neu-card transition-all duration-200 hover:-translate-y-0.5 ${!v.is_active ? "opacity-60" : ""}`}
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                {/* Vehicle image */}
                <div
                  className="w-full sm:w-40 md:w-52 h-32 sm:h-36 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => onEdit(v)}
                  style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)" }}
                >
                  <img src={v.img || "/placeholder.svg"} alt={v.name} className="w-full h-full object-cover" />
                </div>

                {/* Info section */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <button onClick={() => onEdit(v)} className="text-left hover:text-primary transition-colors">
                        <h3 className="text-base md:text-lg font-bold text-foreground truncate">{v.brand} {v.name}</h3>
                      </button>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{v.year}</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-xs text-muted-foreground">{v.type}</span>
                        {getStatusBadge(v)}
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                    <div className="bg-background/60 rounded-xl p-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">P. Público</span>
                      <p className="text-sm md:text-base font-bold text-foreground mt-0.5">{fmtMXN(v.price_public)}</p>
                    </div>
                    <div className="bg-background/60 rounded-xl p-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold block">P. Empleado</span>
                      <p className="text-sm md:text-base font-bold text-foreground mt-0.5">{fmtMXN(v.price_employee)}</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-primary font-semibold block">Margen</span>
                      <p className="text-sm md:text-base font-bold text-primary mt-0.5">
                        {fmtMXN(margin)} <span className="text-[10px] font-normal text-muted-foreground">({marginPct}%)</span>
                      </p>
                    </div>
                    <div className="bg-background/60 rounded-xl p-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1 block">
                        <Gauge className="h-3 w-3" /> Km
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{v.mileage || "—"}</p>
                    </div>
                    <div className="bg-background/60 rounded-xl p-2.5">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1 block">
                        <MapPin className="h-3 w-3" /> Ubicación
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{v.location || "—"}</p>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border/30">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      {v.vin && <span className="font-mono">Serial: {v.vin}</span>}
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {v.status}</span>
                      <span>{v.images?.length || 0} fotos</span>
                      {v.release_at_public && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(v.release_at_public).toLocaleDateString("es-MX")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => onEdit(v)} className="rounded-full text-[10px] uppercase tracking-widest gap-1 h-8 px-3">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      {v.sold_at && onMarkAvailable ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkAvailable(v)}
                          className="rounded-full text-[10px] uppercase tracking-widest gap-1 h-8 px-3 text-green-700 border-green-300 hover:bg-green-500/10"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Regresar
                        </Button>
                      ) : (
                        !v.sold_at && onMarkSold && (
                          <Button variant="outline" size="sm" onClick={() => onMarkSold(v)} className="rounded-full text-[10px] uppercase tracking-widest gap-1 h-8 px-3 text-primary border-primary/30 hover:bg-primary/10">
                            <BadgeDollarSign className="h-3.5 w-3.5" /> Vendido
                          </Button>
                        )
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onToggleActive(v)} title={v.is_active ? "Pausar" : "Activar"} className="h-8 w-8 rounded-full">
                        {v.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      </Button>
                      <DeleteButton vehicle={v} onDelete={onDelete} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
