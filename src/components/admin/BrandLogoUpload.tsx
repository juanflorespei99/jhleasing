import { useState, useRef } from "react";
import { Upload, Check, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  brandName: string;
  /** Called after the logo has been uploaded + upserted so the parent can refetch. */
  onUploaded?: () => void;
}

const ALLOWED_TYPES = ["image/png", "image/webp", "image/jpeg"];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function BrandLogoUpload({ brandName, onUploaded }: Props) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Solo se permiten archivos PNG, JPG o WebP para logos.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("El logo debe pesar menos de 2 MB.");
      return;
    }

    setUploading(true);
    setDone(false);

    try {
      // Upload to brand-logos bucket.
      const ext = file.name.split(".").pop() || "png";
      const path = `${slugify(brandName)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("brand-logos")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) throw uploadError;

      // Get the public URL.
      const { data: urlData } = supabase.storage
        .from("brand-logos")
        .getPublicUrl(path);
      const logoUrl = urlData.publicUrl;

      // Upsert into brand_logos table.
      const { error: dbError } = await (supabase as any)
        .from("brand_logos")
        .upsert(
          {
            brand_name: brandName,
            logo_url: logoUrl,
            created_by: user?.id ?? null,
          },
          { onConflict: "brand_name" },
        );
      if (dbError) throw dbError;

      setPreviewUrl(logoUrl);
      setDone(true);
      toast.success(`Logo de "${brandName}" subido correctamente.`);
      onUploaded?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error subiendo el logo";
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3 mt-2 p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`Logo ${brandName}`}
          className="h-10 w-10 object-contain rounded"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-muted/50 flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          Logo de "{brandName}"
        </p>
        <p className="text-[10px] text-muted-foreground">
          {done
            ? "Logo subido correctamente"
            : "PNG, JPG o WebP. Máx 2 MB. Fondo transparente recomendado."}
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        onChange={handleFile}
        className="hidden"
        id="brand-logo-upload"
      />

      {done ? (
        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
          <Check className="h-4 w-4" /> Listo
        </div>
      ) : (
        <label htmlFor="brand-logo-upload">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={uploading}
            className="rounded-full text-xs"
          >
            <span>
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-1" />
              )}
              {uploading ? "Subiendo..." : "Subir logo"}
            </span>
          </Button>
        </label>
      )}
    </div>
  );
}
