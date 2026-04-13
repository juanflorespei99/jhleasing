import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { fmtMXN } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isKnownBrand } from "@/data/brands";
import { VEHICLE_TYPES as TYPES, VEHICLE_COLORS as COLORS, PLATE_STATES } from "@/data/vehicleOptions";
import { useCustomBrandLogos } from "@/hooks/useCustomBrandLogos";
import BrandCombobox from "@/components/admin/BrandCombobox";
import BrandLogoUpload from "@/components/admin/BrandLogoUpload";
import { toast } from "sonner";
import type { VehicleAdminRow } from "@/types/vehicle";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleAdminRow | null;
  onSaved: () => void;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function VehicleForm({ open, onOpenChange, vehicle, onSaved }: Props) {
  const { user } = useAuth();
  const { customBrands, refetch: refetchLogos } = useCustomBrandLogos();
  const isEdit = !!vehicle;

  const [brand, setBrand] = useState("");
  const isCustomBrand = brand.length > 0 && !isKnownBrand(brand);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [pricePublic, setPricePublic] = useState(0);
  const [priceEmployee, setPriceEmployee] = useState(0);
  const [mileage, setMileage] = useState("");
  const [vin, setVin] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isArmored, setIsArmored] = useState(false);
  const [color, setColor] = useState("");
  const [plateState, setPlateState] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date | undefined>();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setName(vehicle.name);
      setType(vehicle.type);
      setYear(vehicle.year);
      setPricePublic(vehicle.price_public);
      setPriceEmployee(vehicle.price_employee);
      setMileage(vehicle.mileage);
      setVin(vehicle.vin);
      setLocation(vehicle.location);
      setDescription(vehicle.description);
      setIsPublic(vehicle.is_public);
      setIsActive(vehicle.is_active);
      setIsArmored(vehicle.is_armored);
      setColor(vehicle.color || "");
      setPlateState(vehicle.plate_state || "");
      setReleaseDate(vehicle.release_at_public ? new Date(vehicle.release_at_public) : undefined);
      setExistingImages(vehicle.images || []);
    } else {
      setBrand(""); setName(""); setType(""); setYear(new Date().getFullYear());
      setPricePublic(0); setPriceEmployee(0); setMileage(""); setVin("");
      setLocation(""); setDescription(""); setIsPublic(true); setIsActive(true);
      setIsArmored(false); setColor(""); setPlateState("");
      setReleaseDate(undefined); setExistingImages([]);
    }
    setImageFiles([]);
    setError("");
  }, [vehicle, open]);

  const margin = pricePublic - priceEmployee;
  const marginPct = pricePublic > 0 ? ((margin / pricePublic) * 100).toFixed(1) : "0";

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_IMAGE_BYTES = 100 * 1024 * 1024; // 100 MB
  const MAX_IMAGE_MB = 100;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        toast.error(`"${f.name}": tipo no permitido. Usa JPG, PNG o WebP.`);
        continue;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`"${f.name}": supera el límite de ${MAX_IMAGE_MB} MB.`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length > 0) setImageFiles((prev) => [...prev, ...valid]);
    // Reset the input so the same file can be re-selected after rejection
    e.target.value = "";
  };

  const removeNewImage = (i: number) => setImageFiles(prev => prev.filter((_, idx) => idx !== i));
  const removeExistingImage = (i: number) => setExistingImages(prev => prev.filter((_, idx) => idx !== i));

  /**
   * Uploads all selected images in parallel. Reports any per-file failures
   * via toast and returns only the successfully uploaded URLs, so a partial
   * failure does not abort the whole save flow.
   */
  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    const results = await Promise.allSettled(
      imageFiles.map(async (file) => {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("vehicle-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw new Error(`${file.name}: ${error.message}`);
        const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
        return data.publicUrl;
      }),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      const messages = failed
        .map((r) => (r as PromiseRejectedResult).reason?.message ?? "error desconocido")
        .join("; ");
      toast.error(`No se pudieron subir ${failed.length} imagen(es): ${messages}`);
    }

    return results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!brand || !name || !type) {
      setError("Completa los campos obligatorios");
      return;
    }

    setSaving(true);
    try {
      const uploadedUrls = await uploadImages();
      const allImages = [...existingImages, ...uploadedUrls];
      const slug = slugify(`${brand}-${name}-${year}`);

      const payload = {
        brand, name, type, year, slug,
        price_public: pricePublic,
        price_employee: priceEmployee,
        mileage, vin, location, description,
        is_public: isPublic,
        is_active: isActive,
        is_armored: isArmored,
        color,
        plate_state: plateState,
        release_at_public: releaseDate?.toISOString() || null,
        img: allImages[0] || "",
        images: allImages,
        created_by: vehicle?.created_by || user?.id || null,
      };

      if (isEdit && vehicle) {
        const { error } = await supabase.from("vehicles").update(payload).eq("id", vehicle.id);
        if (error) throw error;
        toast.success("Vehículo actualizado");
      } else {
        const { error } = await supabase.from("vehicles").insert(payload);
        if (error) throw error;
        toast.success("Vehículo creado");
      }

      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error guardando vehículo";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100vw-1.5rem)] max-h-[90vh] p-0 rounded-2xl flex flex-col gap-0">
        <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6 pb-3 shrink-0 border-b border-border/30">
          <DialogTitle className="text-base md:text-lg">{isEdit ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Scrollable body — header and footer stay outside this area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-5">
          {/* Brand + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-xs">Marca *</Label>
              <BrandCombobox
                value={brand}
                onChange={setBrand}
                customBrands={customBrands}
              />
              {isCustomBrand && (
                <BrandLogoUpload
                  brandName={brand}
                  onUploaded={refetchLogos}
                />
              )}
            </div>
            <div>
              <Label className="text-xs">Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Name + Year */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="col-span-2">
              <Label className="text-xs">Modelo / Nombre *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Aveo LT" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Año</Label>
              <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="mt-1" />
            </div>
          </div>

          {/* Prices + Margin */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <Label className="text-xs">Precio Público</Label>
              <Input type="number" value={pricePublic} onChange={e => setPricePublic(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Precio Empleado</Label>
              <Input type="number" value={priceEmployee} onChange={e => setPriceEmployee(Number(e.target.value))} className="mt-1" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">Margen</Label>
              <div className="h-10 flex items-center px-3 rounded-md border bg-muted/30 mt-1">
                <span className="text-primary font-bold text-sm">
                  {fmtMXN(margin)}
                </span>
                <span className="text-[10px] text-muted-foreground ml-1">({marginPct}%)</span>
              </div>
            </div>
          </div>

          {/* Mileage, Serial Number, Location */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            <div>
              <Label className="text-xs">Kilometraje</Label>
              <Input value={mileage} onChange={e => setMileage(e.target.value)} placeholder="0 km" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Serial Number</Label>
              <Input value={vin} onChange={e => setVin(e.target.value)} className="mt-1" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs">Ubicación</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="CDMX" className="mt-1" />
            </div>
          </div>

          {/* Color + Estado de Placas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-xs">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar color" /></SelectTrigger>
                <SelectContent>
                  {COLORS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Estado de Placas</Label>
              <Select value={plateState} onValueChange={setPlateState}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  {PLATE_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs">Descripción</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1" />
          </div>

          {/* Release date */}
          <div>
            <Label className="text-xs">Fecha de Liberación Pública</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1 text-xs md:text-sm", !releaseDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {releaseDate ? format(releaseDate, "PPP", { locale: es }) : "Sin fecha (visible inmediatamente)"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={releaseDate} onSelect={setReleaseDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Toggles */}
          <div className="flex gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label className="text-xs">Público</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-xs">Activo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isArmored} onCheckedChange={setIsArmored} />
              <Label className="text-xs">Blindado</Label>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label className="text-xs">Imágenes</Label>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
              {existingImages.map((url, i) => (
                <div key={url} className="relative w-16 h-12 md:w-20 md:h-16 rounded-lg overflow-hidden border">
                  <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {imageFiles.map((f, i) => (
                <div key={i} className="relative w-16 h-12 md:w-20 md:h-16 rounded-lg overflow-hidden border">
                  <img src={URL.createObjectURL(f)} alt={`Nueva imagen ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-12 md:w-20 md:h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG o WebP · Máximo {MAX_IMAGE_MB} MB por imagen</p>
          </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Footer — sibling of the scrollable area, never overlapped */}
          <div className="shrink-0 flex items-center gap-2 md:gap-3 justify-end px-4 md:px-6 py-3 border-t border-border/30 bg-background rounded-b-2xl">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="text-xs md:text-sm">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="text-xs md:text-sm">
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Vehículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
