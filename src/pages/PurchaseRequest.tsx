import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmtMXN } from "@/lib/format";
import { toast } from "sonner";
import logoDark from "@/assets/logo-jhl-dark.png";
import { withVehicleImageFallback } from "@/lib/vehicleImages";

interface VehicleSummary {
  slug: string;
  name: string;
  img: string;
  year: number;
  price_public: number;
  /** Only present when the user is an employee and we read from vehicles_employee. */
  price_employee?: number;
}

export default function PurchaseRequest() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isEmployee, signOut } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleSummary | null>(null);
  const [vin, setVin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // Pick the right view based on the caller's role. Employees can see
        // their preferential price via `vehicles_employee`; everyone else
        // only ever sees `vehicles_public` (which omits price_employee).
        // This matches the pattern used by VehicleDetail.tsx so the price
        // shown here is identical to the one the user just clicked on.
        const query = isEmployee
          ? supabase
              .from("vehicles_employee")
              .select("slug, name, img, year, price_public, price_employee")
              .eq("slug", slug)
              .maybeSingle()
          : supabase
              .from("vehicles_public")
              .select("slug, name, img, year, price_public")
              .eq("slug", slug)
              .maybeSingle();
        const { data, error } = await query;
        if (error) throw error;
        if (data) setVehicle(withVehicleImageFallback(data as VehicleSummary) ?? null);
        else toast.error("Vehículo no encontrado");

        // Fetch VIN via secure RPC (SECURITY DEFINER) — never shown in UI
        const { data: vinData } = await supabase.rpc("get_vehicle_vin", { _slug: slug });
        if (vinData) setVin(vinData);
      } catch {
        toast.error("Error cargando datos del vehículo");
      }
      setLoading(false);
    })();
  }, [slug, isEmployee]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // VIN se envía al formulario HubSpot pero nunca se muestra en la UI
  const hubspotUrl = vin
    ? `https://20qto.share.hsforms.com/2mSS9BFkbQiOR-Z0CT982ZQ?numero_de_serie=${encodeURIComponent(vin)}`
    : `https://20qto.share.hsforms.com/2mSS9BFkbQiOR-Z0CT982ZQ`;

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
        <div className="flex flex-col lg:flex-row gap-6 items-start">

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
                  <p className="text-sm text-muted-foreground mt-1">{vehicle.year}</p>
                  {isEmployee && vehicle.price_employee ? (
                    <div className="mt-2">
                      <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                        Precio preferencial
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {fmtMXN(vehicle.price_employee)}
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        {fmtMXN(vehicle.price_public)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-foreground mt-2">
                      {fmtMXN(vehicle.price_public)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formulario HubSpot como iframe */}
          <div className="flex-1 min-w-0">
            <iframe
              src={hubspotUrl}
              className="w-full border-none block"
              style={{
                height: "clamp(500px, 100vh, 1200px)",
              }}
              title="Formulario de solicitud de compra"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
