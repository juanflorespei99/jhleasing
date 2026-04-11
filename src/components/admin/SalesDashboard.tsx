import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeDollarSign, User, Calendar, FileText, Tag, Trash2, RotateCcw } from "lucide-react";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmtMXN } from "@/lib/format";
import type { VehicleAdminRow } from "@/types/vehicle";

interface Props {
  vehicles: VehicleAdminRow[];
  onDelete: (id: string) => void;
  onMarkAvailable?: (v: VehicleAdminRow) => void;
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

export default function SalesDashboard({ vehicles, onDelete, onMarkAvailable }: Props) {
  const soldVehicles = vehicles
    .filter(v => v.sold_at)
    .sort((a, b) => new Date(b.sold_at!).getTime() - new Date(a.sold_at!).getTime());

  const totalRevenue = soldVehicles.reduce((sum, v) => sum + (v.sold_price || 0), 0);
  const totalMargin = soldVehicles.reduce((sum, v) => sum + ((v.sold_price || 0) - v.price_employee), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="neu-card p-4 md:p-5">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Vendidos</p>
          <p className="text-2xl md:text-3xl font-bold mt-1 text-foreground">{soldVehicles.length}</p>
        </div>
        <div className="neu-card p-4 md:p-5">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Ingresos Totales</p>
          <p className="text-xl md:text-2xl font-bold mt-1 text-primary">{fmtMXN(totalRevenue)}</p>
        </div>
        <div className="neu-card p-4 md:p-5 col-span-2 md:col-span-1">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground">Margen Total</p>
          <p className={`text-xl md:text-2xl font-bold mt-1 ${totalMargin >= 0 ? "text-green-600" : "text-destructive"}`}>
            {fmtMXN(totalMargin)}
          </p>
        </div>
      </div>

      {/* Sold vehicles list */}
      {soldVehicles.length === 0 ? (
        <div className="neu-card p-12 text-center text-muted-foreground">
          <BadgeDollarSign className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-light uppercase tracking-widest">No hay ventas registradas</p>
          <p className="text-sm mt-2">Marca un vehículo como vendido para comenzar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {soldVehicles.map(v => {
            const margin = (v.sold_price || 0) - v.price_employee;
            return (
              <div key={v.id} className="neu-card p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  {/* Image */}
                  <div className="w-full sm:w-36 md:w-44 h-28 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0"
                    style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)" }}>
                    <img src={v.img || "/placeholder.svg"} alt={v.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-foreground truncate">{v.brand} {v.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{v.year}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-xs text-muted-foreground">{v.type}</span>
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Vendido</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Sale details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="bg-primary/5 rounded-xl p-2.5">
                        <span className="text-[9px] uppercase tracking-widest text-primary font-semibold flex items-center gap-1 block">
                          <BadgeDollarSign className="h-3 w-3" /> Precio Venta
                        </span>
                        <p className="text-sm md:text-base font-bold text-primary mt-0.5">{fmtMXN(v.sold_price || 0)}</p>
                      </div>
                      <div className={`rounded-xl p-2.5 ${margin >= 0 ? "bg-green-500/5" : "bg-destructive/5"}`}>
                        <span className={`text-[9px] uppercase tracking-widest font-semibold block ${margin >= 0 ? "text-green-600" : "text-destructive"}`}>Margen</span>
                        <p className={`text-sm md:text-base font-bold mt-0.5 ${margin >= 0 ? "text-green-600" : "text-destructive"}`}>{fmtMXN(margin)}</p>
                      </div>
                      <div className="bg-background/60 rounded-xl p-2.5">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1 block">
                          <User className="h-3 w-3" /> Comprador
                        </span>
                        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{v.buyer_name || "—"}</p>
                      </div>
                      <div className="bg-background/60 rounded-xl p-2.5">
                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1 block">
                          <Calendar className="h-3 w-3" /> Fecha
                        </span>
                        <p className="text-sm font-semibold text-foreground mt-0.5">
                          {v.sold_at ? new Date(v.sold_at).toLocaleDateString("es-MX") : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border/30">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        {v.vin && <span className="font-mono">Serial: {v.vin}</span>}
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {v.brand}</span>
                        {v.sale_notes && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> {v.sale_notes}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {onMarkAvailable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkAvailable(v)}
                            className="rounded-full text-[10px] uppercase tracking-widest gap-1 h-8 px-3 text-green-700 border-green-300 hover:bg-green-500/10"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Regresar al catálogo
                          </Button>
                        )}
                        <DeleteButton vehicle={v} onDelete={onDelete} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
