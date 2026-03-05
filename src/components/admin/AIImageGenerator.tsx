import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, RefreshCw, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: string;
  name: string;
  year: number;
  type: string;
  onImageAccepted: (url: string) => void;
}

function buildPrompt(brand: string, name: string, year: number, type: string) {
  return `Fotografía profesional de estudio de un ${brand} ${name} ${year}, tipo ${type}, vista frontal 3/4, fondo limpio blanco, iluminación de estudio profesional, alta resolución, fotografía comercial de concesionaria`;
}

export default function AIImageGenerator({ open, onOpenChange, brand, name, year, type, onImageAccepted }: Props) {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && !prompt) {
      setPrompt(buildPrompt(brand, name, year, type));
    }
    if (!isOpen) {
      setGeneratedImage(null);
    }
    onOpenChange(isOpen);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-vehicle-image", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.imageBase64) throw new Error("No se recibió imagen");

      setGeneratedImage(data.imageBase64);
    } catch (err: any) {
      toast.error(err.message || "Error al generar imagen");
    } finally {
      setGenerating(false);
    }
  };

  const acceptImage = async () => {
    if (!generatedImage) return;
    setUploading(true);

    try {
      // Convert base64 to blob
      const base64Data = generatedImage.replace(/^data:image\/\w+;base64,/, "");
      const byteArray = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: "image/png" });

      const path = `${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage.from("vehicle-images").upload(path, blob);
      if (error) throw error;

      const { data } = supabase.storage.from("vehicle-images").getPublicUrl(path);
      onImageAccepted(data.publicUrl);
      toast.success("Imagen agregada al vehículo");
      setGeneratedImage(null);
    } catch (err: any) {
      toast.error(err.message || "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generar Imagen con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe la imagen que quieres generar..."
              className="mt-1"
            />
          </div>

          <Button onClick={generate} disabled={generating || !prompt.trim()} className="w-full">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando (~10s)...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Imagen
              </>
            )}
          </Button>

          {generatedImage && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border bg-muted/20">
                <img
                  src={generatedImage}
                  alt="Imagen generada por IA"
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={acceptImage} disabled={uploading} className="flex-1">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Usar esta imagen
                </Button>
                <Button variant="outline" onClick={generate} disabled={generating}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
