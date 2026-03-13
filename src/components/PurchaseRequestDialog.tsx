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

export default function PurchaseRequestDialog({
  open,
  onOpenChange,
  vehicleName,
  vin,
}: PurchaseRequestDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;

    // Clear previous form
    containerRef.current.innerHTML = "";

    // Create the HubSpot form container
    const formDiv = document.createElement("div");
    formDiv.className = "hs-form-frame";
    formDiv.setAttribute("data-region", "na1");
    formDiv.setAttribute("data-form-id", "9924bd04-591b-4223-91f9-9d024fdf3665");
    formDiv.setAttribute("data-portal-id", "3393996");
    formDiv.setAttribute(
      "data-form-payload",
      JSON.stringify({ fields: { numero_de_serie: vin } })
    );
    containerRef.current.appendChild(formDiv);

    // Load the HubSpot script
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/3393996.js";
    script.defer = true;
    containerRef.current.appendChild(script);

    return () => {
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
