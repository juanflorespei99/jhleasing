import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  parseVehicleExcel,
  parsedRowToInsertPayload,
  downloadVehicleTemplate,
  type ParsedVehicleRow,
  type ParseError,
} from "@/lib/vehicleExcel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

type Stage = "pick" | "preview" | "inserting" | "done";

export default function BulkUploadDialog({ open, onOpenChange, onUploaded }: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("pick");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedVehicleRow[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [insertedCount, setInsertedCount] = useState(0);
  const [insertError, setInsertError] = useState<string | null>(null);

  const reset = () => {
    setStage("pick");
    setFileName("");
    setRows([]);
    setErrors([]);
    setInsertedCount(0);
    setInsertError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Reset on close so a fresh open starts clean.
      setTimeout(reset, 200);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const result = await parseVehicleExcel(file);
      setRows(result.rows);
      setErrors(result.errors);
      setStage("preview");
      if (result.totalRowsRead === 0) {
        toast.warning("El archivo está vacío o no contiene filas de datos.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`No se pudo leer el archivo: ${message}`);
      reset();
    }
  };

  const handleConfirmInsert = async () => {
    if (rows.length === 0) return;
    setStage("inserting");
    setInsertError(null);

    const payloads = rows.map((r) => parsedRowToInsertPayload(r, user?.id ?? null));

    const { error, count } = await supabase
      .from("vehicles")
      .insert(payloads, { count: "exact" });

    if (error) {
      setInsertError(error.message);
      setStage("preview");
      toast.error(`Error insertando vehículos: ${error.message}`);
      return;
    }

    setInsertedCount(count ?? payloads.length);
    setStage("done");
    toast.success(`${count ?? payloads.length} vehículo(s) creado(s) exitosamente.`);
    onUploaded();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-4 md:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileSpreadsheet className="h-5 w-5" />
            Carga masiva de vehículos
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Sube una plantilla Excel con varios vehículos a la vez. Las imágenes se agregan después editando cada vehículo.
          </DialogDescription>
        </DialogHeader>

        {/* STAGE: pick file */}
        {stage === "pick" && (
          <div className="space-y-4 py-4">
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona el archivo .xlsx que descargaste y llenaste.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-upload-file-input"
              />
              <label htmlFor="bulk-upload-file-input">
                <Button asChild className="rounded-full">
                  <span>
                    <Upload className="h-4 w-4 mr-1.5" />
                    Elegir archivo
                  </span>
                </Button>
              </label>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">¿No tienes la plantilla?</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => void downloadVehicleTemplate()}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Descargar plantilla vacía
              </Button>
            </div>
          </div>
        )}

        {/* STAGE: preview */}
        {(stage === "preview" || stage === "inserting") && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="truncate">{fileName}</span>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-500/10 border border-green-200 px-4 py-3">
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {rows.length} válida(s)
                </div>
                <p className="text-[11px] text-green-700/80 mt-0.5">
                  Listas para insertar
                </p>
              </div>
              <div
                className={`rounded-xl px-4 py-3 border ${
                  errors.length > 0
                    ? "bg-destructive/10 border-destructive/30"
                    : "bg-muted/30 border-border"
                }`}
              >
                <div
                  className={`flex items-center gap-2 font-semibold text-sm ${
                    errors.length > 0 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  {errors.length} error(es)
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {errors.length > 0
                    ? "Estas filas se ignorarán al insertar"
                    : "Todo bien"}
                </p>
              </div>
            </div>

            {/* Errors list */}
            {errors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-destructive mb-2">
                  Errores encontrados:
                </p>
                <ul className="space-y-1.5 text-xs">
                  {errors.map((e, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-destructive font-mono shrink-0">
                        Fila {e.excelRow}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-foreground/80">
                        <strong>{e.field}:</strong> {e.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Valid rows preview */}
            {rows.length > 0 && (
              <div className="rounded-xl border overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium">#</th>
                        <th className="text-left px-3 py-2 font-medium">Marca</th>
                        <th className="text-left px-3 py-2 font-medium">Modelo</th>
                        <th className="text-left px-3 py-2 font-medium">Año</th>
                        <th className="text-right px-3 py-2 font-medium">Precio Público</th>
                        <th className="text-right px-3 py-2 font-medium">Precio Empleado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.excelRow} className="border-t">
                          <td className="px-3 py-1.5 text-muted-foreground">{r.excelRow}</td>
                          <td className="px-3 py-1.5">{r.brand}</td>
                          <td className="px-3 py-1.5">{r.name}</td>
                          <td className="px-3 py-1.5">{r.year}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            ${r.price_public.toLocaleString("es-MX")}
                          </td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            ${r.price_employee.toLocaleString("es-MX")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {insertError && (
              <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {insertError}
              </div>
            )}
          </div>
        )}

        {/* STAGE: done */}
        {stage === "done" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
            <h3 className="text-lg font-semibold">¡Listo!</h3>
            <p className="text-sm text-muted-foreground">
              Se crearon <strong>{insertedCount}</strong> vehículo(s).
              <br />
              Recuerda agregar las imágenes y completar los datos faltantes editando cada uno.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {stage === "pick" && (
            <Button variant="outline" onClick={() => handleClose(false)} className="text-xs">
              Cancelar
            </Button>
          )}
          {stage === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={reset}
                className="text-xs"
              >
                Elegir otro archivo
              </Button>
              <Button
                onClick={handleConfirmInsert}
                disabled={rows.length === 0}
                className="text-xs"
              >
                Insertar {rows.length} vehículo(s)
              </Button>
            </>
          )}
          {stage === "inserting" && (
            <Button disabled className="text-xs">
              Insertando...
            </Button>
          )}
          {stage === "done" && (
            <Button onClick={() => handleClose(false)} className="text-xs">
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
