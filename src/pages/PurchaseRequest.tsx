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
          onFormReady: (form: unknown) => {
            const setVinValue = () => {
              const selectors = [
                'input[name="numero_de_serie"]',
                'input[name="TICKET.numero_de_serie"]',
                'input[name="numero_de_serie_"]',
              ];
              let vinInput: HTMLInputElement | null = null;
              const formElement =
                form instanceof HTMLFormElement
                  ? form
                  : typeof form === "object" && form !== null && "get" in form &&
                      typeof (form as { get?: (i: number) => unknown }).get === "function"
                    ? ((form as { get: (i: number) => unknown }).get(0) as HTMLFormElement | null)
                    : null;
              const searchRoot = formElement || document.getElementById("hubspot-purchase-form");
              for (const sel of selectors) {
                vinInput = searchRoot?.querySelector(sel) as HTMLInputElement | null;
                if (vinInput) break;
              }
              if (vinInput) {
                const setter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype, "value"
                )?.set;
                if (setter) setter.call(vinInput, vin);
                else vinInput.value = vin;
                vinInput.dispatchEvent(new Event("input", { bubbles: true }));
                vinInput.dispatchEvent(new Event("change", { bubbles: true }));
                return true;
              }
              return false;
            };
            if (!setVinValue()) {
              setTimeout(setVinValue, 500);
              setTimeout(setVinValue, 1500);
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
    <div className="min-h-screen bg-background p-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div className="max-w-screen-md mx-auto">
        {/* NAV */}
        <nav className="flex justify-between items-center mb-12 px-3">
          <Link to="/">
            <img src={logoDark} alt="JH Leasing" className="h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to={`/vehiculo/${slug}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al vehículo
            </Link>
            {user ? (
              <button onClick={() => signOut()} className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity">
                Salir
              </button>
            ) : (
              <Link to="/login" className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>

        {/* FORM CARD */}
        <div className="neu-card">
          <div className="p-10">
            {vehicle && (
              <div className="mb-8">
                <img
                  src={vehicle.img}
                  alt={vehicle.name}
                  className="w-full h-56 object-cover rounded-xl mb-4"
                />
                <h2 className="text-lg font-bold text-foreground">{vehicle.name}</h2>
                <p className="text-sm text-muted-foreground">{vehicle.year} · ${vehicle.price_public.toLocaleString("en-US")} MXN</p>
                <div className="border-t border-border mt-6 pt-6" />
              </div>
            )}
            <span className="label-micro block mb-2">Solicitar Compra</span>
            {vehicle && (
              <p className="text-base text-muted-foreground mb-8">
                Completa el formulario para solicitar la compra de <strong>{vehicle.name}</strong>. Nuestro equipo te contactará para dar seguimiento.
              </p>
            )}
            <div id="hubspot-purchase-form" ref={containerRef} className="min-h-[300px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
