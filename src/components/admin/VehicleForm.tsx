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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { VehicleRow } from "./VehicleTable";

const BRANDS = ["Chevrolet", "Nissan", "Hyundai", "GMC", "Dodge", "MG", "Toyota", "Volkswagen", "KIA"];
const TYPES = ["SUV", "Sedán", "Hatchback", "Pick-up", "Van", "Coupé"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleRow | null;
  onSaved: () => void;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function VehicleForm({ open, onOpenChange, vehicle, onSaved }: Props) {
  const { user } = useAuth();
  const isEdit = !!vehicle;

  const [brand, setBrand] = useState("");
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
      setReleaseDate(vehicle.release_at_public ? new Date(vehicle.release_at_public) : undefined);
      setExistingImages(vehicle.images || []);
    } else {
      setBrand(""); setName(""); setType(""); setYear(new Date().getFullYear());
      setPricePublic(0); setPriceEmployee(0); setMileage(""); setVin("");
      setLocation(""); setDescription(""); setIsPublic(true); setIsActive(true);
      setReleaseDate(undefined); setExistingImages([]);
    }
    setImageFiles([]);
    setError("");
  }, [vehicle, open]);

  const margin = pricePublic - priceEmployee;
  const marginPct = pricePublic > 0 ? ((margin / pricePublic) * 100).toFixed(1) : "0";

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeNewImage = (i: number) => setImageFiles(prev => prev.filter((_, idx) => idx !== i));
  const removeExistingImage = (i: number) => setExistingImages(prev => prev.filter((_, idx) => idx !== i));

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("vehicle-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!brand || !name || !type) { setError("Completa los campos obligatorios"); return; }

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
        release_at_public: releaseDate?.toISOString() || null,
        img: allImages[0] || "",
        images: allImages,
        created_by: vehicle?.created_by || user?.id || null,
      };

      if (isEdit && vehicle) {
        const { error } = await supabase.from("vehicles").update(payload).eq("id", vehicle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vehicles").insert(payload as any);
        if (error) throw error;
      }

      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Marca *</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Name + Year */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label>Modelo / Nombre *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Aveo LT" />
            </div>
            <div>
              <Label>Año</Label>
              <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
            </div>
          </div>

          {/* Prices + Margin */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Precio Público</Label>
              <Input type="number" value={pricePublic} onChange={e => setPricePublic(Number(e.target.value))} />
            </div>
            <div>
              <Label>Precio Empleado</Label>
              <Input type="number" value={priceEmployee} onChange={e => setPriceEmployee(Number(e.target.value))} />
            </div>
            <div>
              <Label>Margen</Label>
              <div className="h-10 flex items-center px-3 rounded-md border bg-muted/30">
                <span className="text-primary font-bold">
                  {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(margin)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">({marginPct}%)</span>
              </div>
            </div>
          </div>

          {/* Mileage, VIN, Location */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Kilometraje</Label>
              <Input value={mileage} onChange={e => setMileage(e.target.value)} placeholder="0 km" />
            </div>
            <div>
              <Label>VIN</Label>
              <Input value={vin} onChange={e => setVin(e.target.value)} />
            </div>
            <div>
              <Label>Ubicación</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="CDMX" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Descripción</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          {/* Release date */}
          <div>
            <Label>Fecha de Liberación Pública</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !releaseDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDate ? format(releaseDate, "PPP", { locale: es }) : "Sin fecha (visible inmediatamente)"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={releaseDate} onSelect={setReleaseDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Toggles */}
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label>Público</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Activo</Label>
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>Imágenes</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {existingImages.map((url, i) => (
                <div key={url} className="relative w-20 h-16 rounded-lg overflow-hidden border">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {imageFiles.map((f, i) => (
                <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear Vehículo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
