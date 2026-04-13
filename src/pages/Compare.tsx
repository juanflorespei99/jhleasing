import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useVehicles";
import { fmt, getDisplayPrice } from "@/lib/format";
import type { VehicleRow } from "@/types/vehicle";
import logoDark from "@/assets/logo-jhl-dark.png";
import VehicleCompareSelector from "@/components/VehicleCompareSelector";

function parseMileage(m: string): number | null {
  const match = m.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const { isEmployee, user, signOut, isLoading } = useAuth();
  const { vehicles, loading } = useVehicles(isEmployee, isLoading);

  const slugA = params.get("a");
  const slugB = params.get("b");

  const vehicleA = useMemo(() => vehicles.find((v) => v.slug === slugA) ?? null, [vehicles, slugA]);
  const vehicleB = useMemo(() => vehicles.find((v) => v.slug === slugB) ?? null, [vehicles, slugB]);

  const setSlug = (key: "a" | "b", slug: string) => {
    const p = new URLSearchParams(params);
    p.set(key, slug);
    setParams(p, { replace: true });
  };

  const insights = useMemo(() => {
    if (!vehicleA || !vehicleB) return [];
    const notes: string[] = [];

    const pA = getDisplayPrice(vehicleA, isEmployee);
    const pB = getDisplayPrice(vehicleB, isEmployee);
    if (pA !== pB) {
      const cheaper = pA < pB ? vehicleA : vehicleB;
      notes.push(`${cheaper.name} es $${fmt(Math.abs(pA - pB))} más económico`);
    } else {
      notes.push("Ambos tienen el mismo precio");
    }

    if (vehicleA.year !== vehicleB.year) {
      const newer = vehicleA.year > vehicleB.year ? vehicleA : vehicleB;
      const diff = Math.abs(vehicleA.year - vehicleB.year);
      notes.push(`${newer.name} es ${diff} año${diff > 1 ? "s" : ""} más reciente`);
    } else {
      notes.push(`Ambos son modelo ${vehicleA.year}`);
    }

    const kmA = parseMileage(vehicleA.mileage);
    const kmB = parseMileage(vehicleB.mileage);
    if (kmA !== null && kmB !== null && kmA !== kmB) {
      const less = kmA < kmB ? vehicleA : vehicleB;
      notes.push(`${less.name} tiene ${fmt(Math.abs(kmA - kmB))} km menos`);
    } else if (kmA !== null && kmB !== null) {
      notes.push("Ambos tienen kilometraje similar");
    }

    if (vehicleA.type === vehicleB.type) {
      notes.push(`Ambos son ${vehicleA.type}`);
    } else {
      notes.push(`${vehicleA.name} es ${vehicleA.type}, ${vehicleB.name} es ${vehicleB.type}`);
    }

    if (vehicleA.location === vehicleB.location) {
      notes.push(`Ambos están en ${vehicleA.location}`);
    } else {
      notes.push(`Ubicaciones diferentes: ${vehicleA.location} vs ${vehicleB.location}`);
    }

    return notes;
  }, [vehicleA, vehicleB, isEmployee]);

  const specRows = useMemo(() => {
    if (!vehicleA || !vehicleB) return [];
    return [
      { label: "Precio", a: `$${fmt(getDisplayPrice(vehicleA, isEmployee))}`, b: `$${fmt(getDisplayPrice(vehicleB, isEmployee))}` },
      { label: "Año", a: String(vehicleA.year), b: String(vehicleB.year) },
      { label: "Kilometraje", a: vehicleA.mileage, b: vehicleB.mileage },
      { label: "Tipo", a: vehicleA.type, b: vehicleB.type },
      { label: "Marca", a: vehicleA.brand, b: vehicleB.brand },
      { label: "Ubicación", a: vehicleA.location, b: vehicleB.location },
      { label: "Estatus", a: vehicleA.status, b: vehicleB.status },
    ];
  }, [vehicleA, vehicleB, isEmployee]);

  return (
    <div className="min-h-screen bg-background px-4 py-5 md:p-6">
      <div className="max-w-screen-xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-8 md:mb-12 px-1 md:px-3 gap-3">
          <Link to="/" className="shrink-0">
            <img src={logoDark} alt="JH Leasing" className="h-10 md:h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link to="/inventario" className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              <span className="hidden sm:inline">Inventario</span>
            </Link>
            {user ? (
              <button onClick={() => signOut()} className="px-3 md:px-5 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity">Salir</button>
            ) : (
              <Link to="/login" className="px-4 md:px-5 py-2.5 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground">Iniciar Sesión</Link>
            )}
          </div>
        </nav>

        {/* TITLE */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="heading-xl mb-2">Comparar Vehículos</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Selecciona dos vehículos para ver una comparativa detallada</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando inventario...</p>
          </div>
        ) : (
          <>
            {/* SELECTORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
              <VehicleCompareSelector vehicles={vehicles} selected={slugA} onSelect={(s) => setSlug("a", s)} excludeSlug={slugB} label="Vehículo A" />
              <VehicleCompareSelector vehicles={vehicles} selected={slugB} onSelect={(s) => setSlug("b", s)} excludeSlug={slugA} label="Vehículo B" />
            </div>

            {/* COMPARISON */}
            {vehicleA && vehicleB ? (
              <div className="space-y-5 md:space-y-8">
                {/* Images side by side */}
                <div className="grid grid-cols-2 gap-3 md:gap-6">
                  {[vehicleA, vehicleB].map((v) => (
                    <Link key={v.slug} to={`/vehiculo/${v.slug}`} className="block">
                      <div className="neu-card overflow-hidden group">
                        <img src={v.img} alt={v.name} className="w-full h-28 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="p-3 md:p-6">
                          <span className="label-micro text-[9px] md:text-[11px]">{v.type}</span>
                          <h2 className="text-sm md:text-lg font-bold mt-0.5 md:mt-1 leading-tight">{v.name}</h2>
                          <p className="text-xs md:text-sm mt-0.5 md:mt-1 text-muted-foreground">{v.year}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Specs table */}
                <div className="neu-card">
                  <div className="p-5 md:p-10">
                    <span className="label-micro block mb-4 md:mb-6">Comparativa</span>
                    <div>
                      <div className="grid grid-cols-3 gap-2 md:gap-4 pb-3 md:pb-4 mb-3 md:mb-4 border-b-2 border-border">
                        <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-muted-foreground">Métrica</span>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-center text-primary truncate">{vehicleA.name}</span>
                        <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-center text-primary truncate">{vehicleB.name}</span>
                      </div>
                      {specRows.map((row) => (
                        <div key={row.label} className="grid grid-cols-3 gap-2 md:gap-4 py-3 md:py-4 border-b border-border/50">
                          <span className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-muted-foreground">{row.label}</span>
                          <span className="text-xs md:text-sm font-semibold text-center break-words">{row.a}</span>
                          <span className="text-xs md:text-sm font-semibold text-center break-words">{row.b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="neu-accent">
                  <div className="p-5 md:p-10">
                    <span className="label-micro block mb-4 md:mb-6">Conclusiones</span>
                    <div className="space-y-3 md:space-y-4">
                      {insights.map((text, i) => (
                        <div key={i} className="flex items-start gap-2 md:gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground mt-1.5 shrink-0" />
                          <p className="text-xs md:text-sm leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="neu-card p-10 md:p-16 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 text-muted-foreground">
                  <rect x="2" y="3" width="8" height="18" rx="2" />
                  <rect x="14" y="3" width="8" height="18" rx="2" />
                  <path d="M10 12h4" />
                </svg>
                <p className="heading-md mb-2">Selecciona dos vehículos</p>
                <p className="text-sm text-muted-foreground">Usa los selectores de arriba para elegir los vehículos que deseas comparar</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
