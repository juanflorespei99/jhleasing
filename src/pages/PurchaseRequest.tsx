import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

export default function PurchaseRequest() {
  const { slug } = useParams<{ slug: string }>();
  const { user, signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [vehicle, setVehicle] = useState<{ name: string; vin: string; img: string; year: number; price_public: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch vehicle info
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("name, vin, img, year, price_public")
        .eq("slug", slug)
        .maybeSingle();
      if (data) setVehicle(data);
      setLoading(false);
    })();
  }, [slug]);

  // Mount HubSpot form
  useEffect(() => {
    if (loading || !containerRef.current || !vehicle) return;
    const vin = vehicle.vin;
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
            // Hide HubSpot's decorative content (image + rich text header)
            const hideHubspotDecor = () => {
              const root = document.getElementById("hubspot-purchase-form");
              if (!root) return;
              root.querySelectorAll("img, .hs-richtext, .form-columns-0, .header-image-wrapper").forEach(el => {
                (el as HTMLElement).style.cssText = "display:none!important";
              });
              root.querySelectorAll("iframe").forEach(iframe => {
                try {
                  const doc = (iframe as HTMLIFrameElement).contentDocument;
                  if (!doc) return;
                  const style = doc.createElement("style");
                  style.textContent = "img, .hs-richtext, .form-columns-0, .header-image-wrapper { display:none!important; }";
                  doc.head.appendChild(style);
                } catch (_) { /* cross-origin */ }
              });
            };
            hideHubspotDecor();
            setTimeout(hideHubspotDecor, 300);
            setTimeout(hideHubspotDecor, 1000);

            // Try to set VIN in the form using multiple strategies
            const setVinValue = () => {
              const selectors = [
                'input[name="numero_de_serie"]',
                'input[name="TICKET.numero_de_serie"]',
                'input[name="numero_de_serie_"]',
              ];

              // Strategy 1: Use jQuery $form object (works inside HubSpot iframe)
              if ($form && typeof $form === "object" && "find" in $form) {
                const jqForm = $form as { find: (sel: string) => { val: (v: string) => void; length: number } };
                for (const sel of selectors) {
                  const $input = jqForm.find(sel);
                  if ($input.length > 0) {
                    $input.val(vin);
                    console.log("[HubSpot VIN] Set via jQuery:", sel);
                    return true;
                  }
                }
              }

              // Strategy 2: Search in iframe contentDocument
              const root = document.getElementById("hubspot-purchase-form");
              if (root) {
                const iframes = root.querySelectorAll("iframe");
                for (const iframe of Array.from(iframes)) {
                  try {
                    const doc = (iframe as HTMLIFrameElement).contentDocument;
                    if (!doc) continue;
                    for (const sel of selectors) {
                      const input = doc.querySelector(sel) as HTMLInputElement | null;
                      if (input) {
                        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                        if (setter) setter.call(input, vin);
                        else input.value = vin;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        console.log("[HubSpot VIN] Set via iframe:", sel);
                        return true;
                      }
                    }
                  } catch (_) { /* cross-origin */ }
                }

                // Strategy 3: Search in parent document
                for (const sel of selectors) {
                  const input = root.querySelector(sel) as HTMLInputElement | null;
                  if (input) {
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                    if (setter) setter.call(input, vin);
                    else input.value = vin;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                    console.log("[HubSpot VIN] Set via parent DOM:", sel);
                    return true;
                  }
                }
              }

              console.warn("[HubSpot VIN] Could not find VIN input");
              return false;
            };

            if (!setVinValue()) {
              setTimeout(setVinValue, 500);
              setTimeout(setVinValue, 1500);
              setTimeout(setVinValue, 3000);
            }
          },
          onFormSubmit: ($form: unknown) => {
            // Last-resort: inject VIN right before submission
            if ($form && typeof $form === "object" && "find" in $form) {
              const jqForm = $form as { find: (sel: string) => { val: (v?: string) => string; length: number } };
              const selectors = ['input[name="numero_de_serie"]', 'input[name="TICKET.numero_de_serie"]', 'input[name="numero_de_serie_"]'];
              for (const sel of selectors) {
                const $input = jqForm.find(sel);
                if ($input.length > 0 && !$input.val()) {
                  $input.val(vin);
                  console.log("[HubSpot VIN] Injected on submit:", sel);
                  break;
                }
              }
            }
          },
        });
      } catch (e) {
        console.error("Error cargando formulario de HubSpot:", e);
      }
    })();

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [loading, vehicle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
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
                  <p className="text-sm text-muted-foreground mt-1">{vehicle.year} · ${vehicle.price_public.toLocaleString("en-US")} MXN</p>
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
