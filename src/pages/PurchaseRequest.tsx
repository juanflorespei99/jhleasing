import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmt } from "@/lib/format";
import { toast } from "sonner";
import logoDark from "@/assets/logo-jhl-dark.png";

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
    if (window.hbspt) { resolve(); return; }
    const existing = document.querySelector('script[src*="js.hsforms.net/forms/embed/v2.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("HubSpot script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/v2.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("HubSpot script failed"));
    document.head.appendChild(script);
  });
}

/** All possible selectors HubSpot might render for the serial number field */
const SERIAL_SELECTORS = [
  'input[name="numero_de_serie"]',
  'input[name="numero_de_serie__c"]',
  'input[name="0-1/numero_de_serie"]',
  'input[name="properties.numero_de_serie"]',
];

interface VehicleSummary {
  name: string;
  img: string;
  year: number;
  price_public: number;
}

/**
 * Problem: toLocaleString("en-US") used inline instead of shared fmt,
 * console.error without user feedback, repeated selector arrays.
 * Solution: Use shared fmt, toast on error, extracted SERIAL_SELECTORS constant.
 */
export default function PurchaseRequest() {
  const { slug } = useParams<{ slug: string }>();
  const { user, signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [vehicle, setVehicle] = useState<VehicleSummary | null>(null);
  const [vin, setVin] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch vehicle info + VIN via secure RPC
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const [vehicleRes, vinRes] = await Promise.all([
          supabase
            .from("vehicles")
            .select("name, img, year, price_public")
            .eq("slug", slug)
            .maybeSingle(),
          supabase.rpc("get_vehicle_vin", { _slug: slug }),
        ]);
        if (vehicleRes.error) throw vehicleRes.error;
        if (vehicleRes.data) setVehicle(vehicleRes.data);
        if (vinRes.data) setVin(vinRes.data);
      } catch {
        toast.error("Error cargando datos del vehículo");
      }
      setLoading(false);
    })();
  }, [slug]);

  // Mount HubSpot form
  useEffect(() => {
    if (loading || !containerRef.current || !vehicle || !vin) return;
    const serialNumber = vin;
    let cancelled = false;

    (async () => {
      try {
        await loadHubSpotScript();
        if (cancelled || !window.hbspt || !containerRef.current) return;
        containerRef.current.innerHTML = "";

        window.hbspt.forms.create({
          region: "na1",
          portalId: "3393996",
          formId: "9924bd04-591b-4223-91f9-9d024fdf3665",
          target: "#hubspot-purchase-form",
          onFormReady: ($form: unknown) => {
            // Hide HubSpot's decorative content
            const hideHubspotDecor = () => {
              const root = document.getElementById("hubspot-purchase-form");
              if (!root) return;
              root.querySelectorAll("img, .hs-richtext, .form-columns-0, .header-image-wrapper").forEach(el => {
                (el as HTMLElement).style.cssText = "display:none!important";
              });
              // Hide serial number field by searching all field groups
              root.querySelectorAll('.hs-form-field').forEach(field => {
                const label = field.querySelector('label');
                const input = field.querySelector('input');
                if (
                  (label && /numero.de.serie/i.test(label.textContent || '')) ||
                  (input && /numero_de_serie/i.test(input.name || ''))
                ) {
                  (field as HTMLElement).style.cssText = 'display:none!important';
                }
              });
            };
            hideHubspotDecor();
            setTimeout(hideHubspotDecor, 300);
            setTimeout(hideHubspotDecor, 1000);

            const triggerEvents = (el: HTMLInputElement) => {
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
            };

            /** Find the serial input using multiple selector strategies */
            const findSerialInput = (context?: unknown): HTMLInputElement | null => {
              // Strategy 1: jQuery $form.find (HubSpot provides this)
              if (context && typeof context === "object" && "find" in context) {
                const jq = context as { find: (s: string) => { length: number; get: (i: number) => HTMLInputElement } };
                for (const sel of SERIAL_SELECTORS) {
                  const $input = jq.find(sel);
                  if ($input.length > 0) return $input.get(0);
                }
              }
              // Strategy 2: DOM querySelector with all selectors
              for (const sel of SERIAL_SELECTORS) {
                const el = document.querySelector(sel) as HTMLInputElement | null;
                if (el) return el;
              }
              // Strategy 3: find any input whose name contains "numero_de_serie"
              const all = document.querySelectorAll<HTMLInputElement>('#hubspot-purchase-form input[type="hidden"], #hubspot-purchase-form input');
              for (const inp of all) {
                if (inp.name.includes("numero_de_serie")) return inp;
              }
              return null;
            };

            const setSerial = () => {
              const input = findSerialInput($form);
              if (input) {
                input.value = serialNumber;
                triggerEvents(input);
                // Hide the field container so the user never sees it
                const fieldGroup = input.closest('.hs-form-field');
                if (fieldGroup) (fieldGroup as HTMLElement).style.cssText = 'display:none!important';
                // Also set via jQuery .val() for HubSpot's internal state
                if ($form && typeof $form === "object" && "find" in $form) {
                  const jq = $form as { find: (s: string) => { val: (v: string) => void; length: number } };
                  for (const sel of SERIAL_SELECTORS) {
                    const $i = jq.find(sel);
                    if ($i.length > 0) $i.val(serialNumber);
                  }
                }
                console.log("[JHL] Serial number set:", serialNumber);
                return true;
              }
              return false;
            };

            if (!setSerial()) {
              setTimeout(setSerial, 500);
              setTimeout(setSerial, 1500);
              setTimeout(setSerial, 3000);
              setTimeout(setSerial, 5000);
            }
          },
          onFormSubmit: () => {
            // Force serial number right before submission using all strategies
            for (const sel of SERIAL_SELECTORS) {
              const input = document.querySelector(sel) as HTMLInputElement | null;
              if (input) {
                input.value = serialNumber;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
            // Fallback: find by partial name match
            const all = document.querySelectorAll<HTMLInputElement>('#hubspot-purchase-form input');
            for (const inp of all) {
              if (inp.name.includes("numero_de_serie")) {
                inp.value = serialNumber;
                inp.dispatchEvent(new Event("input", { bubbles: true }));
                inp.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
            console.log("[JHL] onFormSubmit — serial forced:", serialNumber);
          },
          onFormSubmitted: () => {
            if (slug) {
              supabase.rpc("reserve_vehicle", { _slug: slug }).then(({ error }) => {
                if (error) console.error("reserve_vehicle error:", error);
              });
            }
          },
        });
      } catch {
        toast.error("Error cargando formulario");
      }
    })();

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [loading, vehicle, vin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-screen-xl mx-auto">
        {/* NAV */}
        <nav className="flex justify-between items-center mb-6 md:mb-10 px-1 md:px-3">
          <Link to="/">
            <img src={logoDark} alt="JH Leasing" className="h-14 md:h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to={`/vehiculo/${slug}`}
              className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Volver al vehículo</span>
              <span className="sm:hidden">Volver</span>
            </Link>
            {user ? (
              <button onClick={() => signOut()} className="px-4 md:px-5 py-2 md:py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity">
                Salir
              </button>
            ) : (
              <Link to="/login" className="px-4 md:px-5 py-2 md:py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Vehicle summary — sticky on desktop */}
          {vehicle && (
            <div className="lg:w-[380px] shrink-0">
              <div className="neu-card lg:sticky lg:top-6">
                <img
                  src={vehicle.img}
                  alt={vehicle.name}
                  className="w-full h-40 md:h-56 object-cover rounded-t-xl"
                />
                <div className="p-5">
                  <h2 className="text-base md:text-lg font-bold text-foreground">{vehicle.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{vehicle.year} · ${fmt(vehicle.price_public)} MXN</p>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: Form */}
          <div className="flex-1 min-w-0">
            <div className="neu-card">
              <div className="p-6 md:p-10">
                <span className="label-micro block mb-2">Solicitar Compra</span>
                {vehicle && (
                  <p className="text-sm md:text-base text-muted-foreground mb-6">
                    Completa el formulario para solicitar la compra de <strong>{vehicle.name}</strong>.
                  </p>
                )}
                <style>{`
                  #hubspot-purchase-form .hs-form-private .legal-consent-container { margin-top: 0; }
                  #hubspot-purchase-form img { display: none !important; }
                  #hubspot-purchase-form .hs-richtext { display: none !important; }
                  #hubspot-purchase-form .form-columns-0 { display: none !important; }
                  #hubspot-purchase-form .header-image-wrapper,
                  #hubspot-purchase-form .hs-form-header,
                  #hubspot-purchase-form .sprocket-header { display: none !important; }
                  #hubspot-purchase-form .hs_numero_de_serie { display: none !important; }
                  #hubspot-purchase-form .hs_numero_de_serie__c { display: none !important; }
                  #hubspot-purchase-form .hs_properties_numero_de_serie { display: none !important; }
                `}</style>
                <div id="hubspot-purchase-form" ref={containerRef} className="min-h-[300px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
