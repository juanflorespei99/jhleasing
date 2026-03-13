import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleName: string;
  vin: string;
}

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (opts: Record<string, unknown>) => void;
      };
    };
  }
}

function loadHubSpotScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.hbspt) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src*="js.hsforms.net"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/v2.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export default function PurchaseRequestDialog({
  open,
  onOpenChange,
  vehicleName,
  vin,
}: PurchaseRequestDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    let cancelled = false;

    loadHubSpotScript().then(() => {
      if (cancelled || !containerRef.current || !window.hbspt) return;

      // Clear previous render
      containerRef.current.innerHTML = "";

      window.hbspt.forms.create({
        region: "na1",
        portalId: "3393996",
        formId: "9924bd04-591b-4223-91f9-9d024fdf3665",
        target: containerRef.current,
        onFormReady: ($form: HTMLFormElement) => {
          // Pre-fill the hidden VIN field
          const vinInput = $form.querySelector(
            'input[name="numero_de_serie"]'
          ) as HTMLInputElement | null;
          if (vinInput) {
            vinInput.value = vin;
            vinInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
        },
      });
    });

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [open, vin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Solicitar Compra
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para solicitar la compra de{" "}
            <strong>{vehicleName}</strong>. Nuestro equipo te contactará para
            dar seguimiento.
          </DialogDescription>
        </DialogHeader>
        <div ref={containerRef} className="min-h-[200px]" />
      </DialogContent>
    </Dialog>
  );
}
