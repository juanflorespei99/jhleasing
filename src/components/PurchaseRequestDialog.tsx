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
  return new Promise((resolve, reject) => {
    if (window.hbspt) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src*="js.hsforms.net/forms/embed/v2.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("No se pudo cargar el script de HubSpot"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el script de HubSpot"));
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
    if (!open) return;

    let cancelled = false;

    const mountHubspotForm = async () => {
      try {
        await loadHubSpotScript();
        if (cancelled || !window.hbspt) return;

        const container =
          containerRef.current ??
          (document.getElementById("hubspot-form-container") as HTMLDivElement | null);

        if (!container) return;

        // Clear previous render
        container.innerHTML = "";

        window.hbspt.forms.create({
          region: "na1",
          portalId: "3393996",
          formId: "9924bd04-591b-4223-91f9-9d024fdf3665",
          target: "#hubspot-form-container",
          onFormReady: (form: unknown) => {
            const setVinValue = () => {
              // Try multiple selectors to find the VIN input
              const selectors = [
                'input[name="numero_de_serie"]',
                'input[name="TICKET.numero_de_serie"]',
                'input[name="numero_de_serie_"]',
              ];

              let vinInput: HTMLInputElement | null = null;

              // Search in the form element if available
              const formElement =
                form instanceof HTMLFormElement
                  ? form
                  : typeof form === "object" &&
                      form !== null &&
                      "get" in form &&
                      typeof (form as { get?: (index: number) => unknown }).get === "function"
                    ? ((form as { get: (index: number) => unknown }).get(0) as HTMLFormElement | null)
                    : null;

              const searchRoot = formElement || document.getElementById("hubspot-form-container");

              for (const sel of selectors) {
                vinInput = searchRoot?.querySelector(sel) as HTMLInputElement | null;
                if (vinInput) break;
              }

              if (vinInput) {
                // Use native setter to trigger HubSpot's internal listeners
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype, "value"
                )?.set;
                if (nativeInputValueSetter) {
                  nativeInputValueSetter.call(vinInput, vin);
                } else {
                  vinInput.value = vin;
                }
                vinInput.dispatchEvent(new Event("input", { bubbles: true }));
                vinInput.dispatchEvent(new Event("change", { bubbles: true }));
                console.log(`[HubSpot] VIN set to: ${vin}`, vinInput.value);
                return true;
              }

              console.warn("[HubSpot] VIN input not found with selectors:", selectors);
              return false;
            };

            // Try immediately, then retry with delays
            if (!setVinValue()) {
              setTimeout(setVinValue, 500);
              setTimeout(setVinValue, 1500);
            }
          },
        });
      } catch (error) {
        console.error("Error cargando formulario de HubSpot:", error);
      }
    };

    const timer = window.setTimeout(mountHubspotForm, 0);


    return () => {
      cancelled = true;
      window.clearTimeout(timer);

      const container =
        containerRef.current ??
        (document.getElementById("hubspot-form-container") as HTMLDivElement | null);

      if (container) {
        container.innerHTML = "";
      }
    };
  }, [open, vin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-visible p-0">
        <div className="overflow-y-auto max-h-[90vh] p-6">
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
          <div id="hubspot-form-container" ref={containerRef} className="min-h-[200px]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
