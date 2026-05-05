import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleName: string;
  vehicleYear: number;
}

const RECIPIENT = "mmascote@jhl.mx";

export default function ScheduleVisitDialog({ open, onOpenChange, vehicleName, vehicleYear }: Props) {
  const [copiedField, setCopiedField] = useState<"email" | "subject" | "body" | "all" | null>(null);

  const subject = `Quiero conocer el ${vehicleName} ${vehicleYear}`;
  const body = `Hola,

Me interesa conocer físicamente la siguiente unidad:

• Vehículo: ${vehicleName}
• Año: ${vehicleYear}

Me gustaría agendar una cita para verla en Corporativo CDMX. Quedo atento(a) a sus indicaciones para coordinar fecha y hora.

Mis datos de contacto:
• Nombre:
• Teléfono:
• Mejor horario para contactarme:

Gracias.`;

  const copy = async (text: string, field: "email" | "subject" | "body" | "all") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      toast.error("No se pudo copiar. Intenta seleccionar el texto manualmente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto bg-background border-none neu-card top-[2.5vh] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="heading-md">Agenda una cita para conocer este vehículo</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Sigue estos 3 pasos para solicitar tu visita en Corporativo CDMX. Hemos preparado todo el correo por ti — solo cópialo y envíalo desde tu correo personal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Paso 1: Destinatario */}
          <div className="neu-inset-sm p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              <span className="label-micro">Destinatario</span>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <a href={`mailto:${RECIPIENT}`} className="text-base font-semibold text-foreground break-all hover:underline">
                {RECIPIENT}
              </a>
              <button
                onClick={() => copy(RECIPIENT, "email")}
                className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0"
              >
                {copiedField === "email" ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Paso 2: Asunto */}
          <div className="neu-inset-sm p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              <span className="label-micro">Asunto</span>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm font-semibold text-foreground flex-1 min-w-0 break-words">{subject}</p>
              <button
                onClick={() => copy(subject, "subject")}
                className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex-shrink-0"
              >
                {copiedField === "subject" ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          {/* Paso 3: Mensaje */}
          <div className="neu-inset-sm p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                <span className="label-micro">Mensaje</span>
              </div>
              <button
                onClick={() => copy(body, "body")}
                className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {copiedField === "body" ? "✓ Copiado" : "Copiar mensaje"}
              </button>
            </div>
            <pre className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans bg-background/50 p-4 rounded-xl border border-border/30">
{body}
            </pre>
          </div>

          {/* Acciones rápidas */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => copy(`Para: ${RECIPIENT}\nAsunto: ${subject}\n\n${body}`, "all")}
              className="flex-1 py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-secondary text-secondary-foreground"
            >
              {copiedField === "all" ? "✓ Todo copiado" : "Copiar todo"}
            </button>
            <a
              href={`mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              className="flex-1 py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground text-center"
            >
              Abrir en mi correo
            </a>
          </div>

          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Te responderemos a la brevedad para coordinar fecha y hora de tu visita.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
