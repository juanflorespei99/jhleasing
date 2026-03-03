import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Pencil, Pause, Play, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface VehicleRow {
  id: string;
  slug: string;
  brand: string;
  name: string;
  type: string;
  year: number;
  price_public: number;
  price_employee: number;
  img: string;
  images: string[];
  status: string;
  is_public: boolean;
  is_active: boolean;
  release_at_public: string | null;
  created_at: string;
  mileage: string;
  vin: string;
  location: string;
  description: string;
  created_by: string | null;
}

interface Props {
  vehicles: VehicleRow[];
  onEdit: (v: VehicleRow) => void;
  onToggleActive: (v: VehicleRow) => void;
  onDelete: (id: string) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

function getStatusBadge(v: VehicleRow) {
  if (!v.is_active) return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inactivo</Badge>;
  if (!v.is_public) return <Badge className="bg-blue-500/20 text-blue-700 border-blue-300">Exclusivo</Badge>;
  return <Badge className="bg-green-500/20 text-green-700 border-green-300">Público</Badge>;
}

export default function VehicleTable({ vehicles, onEdit, onToggleActive, onDelete }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-raised)" }}>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30">
            <TableHead className="w-16">Img</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Año</TableHead>
            <TableHead className="text-right">P. Público</TableHead>
            <TableHead className="text-right">P. Empleado</TableHead>
            <TableHead className="text-right">Margen</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => {
            const margin = v.price_public - v.price_employee;
            const marginPct = v.price_public > 0 ? ((margin / v.price_public) * 100).toFixed(1) : "0";
            return (
              <TableRow key={v.id}>
                <TableCell>
                  <img
                    src={v.img || "/placeholder.svg"}
                    alt={v.name}
                    className="w-12 h-9 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell>{v.brand}</TableCell>
                <TableCell>{v.type}</TableCell>
                <TableCell>{v.year}</TableCell>
                <TableCell className="text-right">{fmt(v.price_public)}</TableCell>
                <TableCell className="text-right">{fmt(v.price_employee)}</TableCell>
                <TableCell className="text-right">
                  <span className="text-primary font-semibold">{fmt(margin)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({marginPct}%)</span>
                </TableCell>
                <TableCell>{getStatusBadge(v)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(v)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggleActive(v)} title={v.is_active ? "Pausar" : "Activar"}>
                      {v.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Eliminar">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará "{v.name}" del inventario.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(v.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {vehicles.length === 0 && (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                No hay vehículos en el inventario
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
