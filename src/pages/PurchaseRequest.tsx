import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmt } from "@/lib/format";
import { toast } from "sonner";
import logoDark from "@/assets/logo-jhl-dark.png";

interface VehicleSummary {
  name: string;
  img: string;
  year: number;
  price_public: number;
  vin: string;
}

export default function PurchaseRequest() {
  const { slug } = useParams<{ slug: string }>();
  const { user, signOut } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener datos del vehículo incluyendo VIN directamente de Supabase
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

  // Cargar el script de HubSpot una sola vez
  useEffect(() => {
    if (document.querySelector('script[src*="js.hsforms.net/forms/embed/3393996.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/3393996.js";
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // El VIN se pasa directamente en data-form-payload — sin manipulación del DOM
  const formPayload = vehicle?.vin
    ? JSON.stringify({ fields: { numero_de_serie: vehicle.vin } })
    : "{}";

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
              <button
                onClick={() => signOut()}
                className="px-4 md:px-5 py-2 md:py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
              >
                Salir
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 md:px-5 py-2 md:py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>

        {/* LAYOUT DOS COLUMNAS */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Tarjeta del vehículo */}
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {vehicle.year} · ${fmt(vehicle.price_public)} MXN
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario HubSpot */}
          <div className="flex-1 min-w-0">
            <div className="neu-card">
              <div className="p-6 md:p-10">
                <span className="label-micro block mb-2">Solicitar Compra</span>
                {vehicle && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Completa el formulario para solicitar la compra de{" "}
                    {vehicle.name}.
                  </p>
                )}

                {/*
                  Método oficial de HubSpot: data-form-payload inyecta el VIN
                  directamente en el campo oculto numero_de_serie antes de renderizar.
                  No requiere manipulación del DOM ni callbacks de timing.
                */}
                <div
                  className="hs-form-frame"
                  data-region="na1"
                  data-form-id="9924bd04-591b-4223-91f9-9d024fdf3665"
                  data-portal-id="3393996"
                  data-form-payload={formPayload}
                />

                <p className="text-xs text-muted-foreground mt-6 text-center">
                  Al enviar este formulario aceptas nuestros términos y condiciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
