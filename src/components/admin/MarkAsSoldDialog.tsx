import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fmtMXN } from "@/lib/format";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BadgeDollarSign } from "lucide-react";
import type { VehicleAdminRow } from "@/types/vehicle";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleAdminRow | null;
  onSaved: () => void;
}

export default function MarkAsSoldDialog({ open, onOpenChange, vehicle, onSaved }: Props) {
  const [soldPrice, setSoldPrice] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && vehicle) {
      setSoldPrice(vehicle.price_public.toString());
      setBuyerName("");
      setSaleNotes("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    const price = parseInt(soldPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Ingresa un precio de venta válido");
      return;
    }
    if (!buyerName.trim()) {
      toast.error("Ingresa el nombre del comprador");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("vehicles")
      .update({
        sold_at: new Date().toISOString(),
        sold_price: price,
        buyer_name: buyerName.trim(),
        sale_notes: saleNotes.trim(),
        status: "Vendido",
        is_active: false,
      })
      .eq("id", vehicle.id);

    if (error) {
      toast.error("Error al registrar la venta");
    } else {
      toast.success(`${vehicle.brand} ${vehicle.name} marcado como vendido`);
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-primary" />
            Registrar Venta
          </DialogTitle>
          <DialogDescription>
            {vehicle.brand} {vehicle.name} {vehicle.year}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/10 border border-border/30">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">P. Público</span>
              <p className="text-sm font-bold">{fmtMXN(vehicle.price_public)}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">P. Empleado</span>
              <p className="text-sm font-bold">{fmtMXN(vehicle.price_employee)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sold-price">Precio final de venta *</Label>
            <Input
              id="sold-price"
              type="number"
              value={soldPrice}
              onChange={e => setSoldPrice(e.target.value)}
              placeholder="Ej: 350000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer-name">Nombre del comprador *</Label>
            <Input
              id="buyer-name"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale-notes">Notas (opcional)</Label>
            <Textarea
              id="sale-notes"
              value={saleNotes}
              onChange={e => setSaleNotes(e.target.value)}
              placeholder="Observaciones de la venta..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Confirmar Venta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
