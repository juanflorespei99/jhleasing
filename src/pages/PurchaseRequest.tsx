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

    /**
     * HubSpot renders forms inside an iframe, so parent-document CSS/JS
     * cannot reach the fields. We must use the $form jQuery object
     * (which lives inside the iframe) to manipulate the form content.
     */
    const hideAndFillSerial = ($form: unknown) => {
      if (!$form || typeof $form !== "object" || !("find" in $form)) return;
      const jq = $form as {
        find: (s: string) => {
          val: (v: string) => { change: () => void };
          closest: (s: string) => { hide: () => void; length: number };
          each: (fn: (this: HTMLElement) => void) => void;
          length: number;
          get: (i: number) => HTMLElement;
        };
        get: (i: number) => HTMLElement;
      };

      // Strategy 1: known selectors
      let found = false;
      for (const sel of SERIAL_SELECTORS) {
        const $i = jq.find(sel);
        if ($i.length > 0) {
          $i.val(serialNumber).change();
          $i.closest('.hs-form-field').hide();
          found = true;
          console.log("[JHL] Serial set via selector:", sel, serialNumber);
        }
      }

      // Strategy 2: find any input with "numero_de_serie" in name
      if (!found) {
        jq.find('input').each(function () {
          if (this instanceof HTMLInputElement && this.name.includes('numero_de_serie')) {
            const $inp = jq.find(`input[name="${this.name}"]`);
            $inp.val(serialNumber).change();
            $inp.closest('.hs-form-field').hide();
            console.log("[JHL] Serial set via partial match:", this.name, serialNumber);
          }
        });
      }

      // Strategy 3: find by label text inside the iframe
      try {
        const iframeDoc = jq.get(0)?.ownerDocument;
        if (iframeDoc) {
          // Inject CSS to hide the field
          if (!iframeDoc.getElementById('jhl-hide-serial')) {
            const style = iframeDoc.createElement('style');
            style.id = 'jhl-hide-serial';
            style.textContent = `
              .hs_numero_de_serie,
              .hs_numero_de_serie__c,
              .hs_properties_numero_de_serie { display: none !important; }
            `;
            iframeDoc.head.appendChild(style);
          }
          // Also find by label text
          iframeDoc.querySelectorAll('.hs-form-field').forEach(field => {
            const label = field.querySelector('label');
            if (label && /numero.de.serie/i.test(label.textContent || '')) {
              (field as HTMLElement).style.cssText = 'display:none!important';
              const input = field.querySelector('input') as HTMLInputElement | null;
              if (input) {
                input.value = serialNumber;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
                console.log("[JHL] Serial set via iframe label match:", serialNumber);
              }
            }
          });
        }
      } catch (e) {
        console.log("[JHL] iframe access attempt:", e);
      }
    };

    // Also hide decorative elements in parent document (non-iframe case)
    const hideDecorInParent = () => {
      const root = document.getElementById("hubspot-purchase-form");
      if (!root) return;
      root.querySelectorAll("img, .hs-richtext, .form-columns-0, .header-image-wrapper").forEach(el => {
        (el as HTMLElement).style.cssText = "display:none!important";
      });
    };

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
            hideDecorInParent();
            hideAndFillSerial($form);
            // Retry several times — HubSpot may re-render fields
            setTimeout(() => { hideDecorInParent(); hideAndFillSerial($form); }, 300);
            setTimeout(() => { hideDecorInParent(); hideAndFillSerial($form); }, 1000);
            setTimeout(() => { hideDecorInParent(); hideAndFillSerial($form); }, 2500);
            setTimeout(() => { hideDecorInParent(); hideAndFillSerial($form); }, 5000);
          },
          onFormSubmit: ($form: unknown) => {
            // Force serial right before HubSpot sends data
            hideAndFillSerial($form);
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
