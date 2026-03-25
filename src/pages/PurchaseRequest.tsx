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

interface VehicleSummary {
  name: string;
  img: string;
  year: number;
  price_public: number;
  vin: string; // ← AÑADIDO: traemos el VIN directo
}

function injectAndHideVin(serialNumber: string) {
  // Buscar en DOM directo
  const allInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name="numero_de_serie"]'
  );
  allInputs.forEach((input) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype, "value"
    )?.set;
    if (nativeSetter) nativeSetter.call(input, serialNumber);
    else input.value = serialNumber;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    // Ocultar el contenedor del campo
    const fieldContainer = input.closest(".hs-form-field");
    if (fieldContainer) {
      (fieldContainer as HTMLElement).style.cssText = "display:none!important";
    }
  });

  // Buscar dentro de iframes (mismo origen)
  document.querySelectorAll("iframe").forEach((iframe) => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const iframeInputs = doc.querySelectorAll<HTMLInputElement>(
        'input[name="numero_de_serie"]'
      );
      iframeInputs.forEach((input) => {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype, "value"
        )?.set;
        if (nativeSetter) nativeSetter.call(input, serialNumber);
        else input.value = serialNumber;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        const fieldContainer = input.closest(".hs-form-field");
        if (fieldContainer) {
          (fieldContainer as HTMLElement).style.cssText = "display:none!important";
        }
      });
    } catch { /* cross-origin, skip */ }
  });
}

export default function PurchaseRequest() {
  const { slug } = useParams<{ slug: string }>();
  const { user, signOut } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [vehicle, setVehicle] = useState<VehicleSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Traemos vin directamente de la tabla, sin RPC separada
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("name, img, year, price_public, vin")
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        if (data) setVehicle(data);
        else toast.error("Vehículo no encontrado");
      } catch {
        toast.error("Error cargando datos del vehículo");
      }
      setLoading(false);
    })();
  }, [slug]);

  // ✅ FIX: El formulario solo se monta cuando tenemos vehicle Y vin confirmado
  useEffect(() => {
    if (loading || !containerRef.current || !vehicle || !vehicle.vin) return;

    const serialNumber = vehicle.vin;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const startObserving = () => {
      const container = containerRef.current;
      if (!container) return;
      observer = new MutationObserver(() => injectAndHideVin(serialNumber));
      observer.observe(container, { childList: true, subtree: true });
      // Polling 500ms por 20 segundos como fallback
      interval = setInterval(() => injectAndHideVin(serialNumber), 500);
      setTimeout(() => {
        if (interval) clearInterval(interval);
        interval = null;
      }, 20000);
    };

    (async () => {
      try {
        await loadHubSpotScript();
        if (cancelled || !window.hbspt || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        startObserving();

        window.hbspt.forms.create({
          region: "na1",
          portalId: "3393996",
          formId: "9924bd04-591b-4223-91f9-9d024fdf3665",
          target: "#hubspot-purchase-form",
          onFormReady: () => {
            console.log("[JHL] Form ready — VIN:", serialNumber);
            injectAndHideVin(serialNumber);
            setTimeout(() => injectAndHideVin(serialNumber), 300);
            setTimeout(() => injectAndHideVin(serialNumber), 800);
            setTimeout(() => injectAndHideVin(serialNumber), 1500);
          },
          onFormSubmit: () => {
            // Último intento justo antes de enviar
            injectAndHideVin(serialNumber);
            console.log("[JHL] Submit — VIN forzado:", serialNumber);
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
      if (observer) observer.disconnect();
      if (interval) clearInterval(interval);
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

          <div className="flex-1 min-w-0">
            <div className="neu-card">
              <div className="p-6 md:p-10">
                <span className="label-micro block mb-2">Solicitar Compra</span>
                <h1 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                  Completa tus datos
                </h1>
                <div id="hubspot-purchase-form" ref={containerRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
