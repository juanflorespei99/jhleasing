import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmt } from "@/data/vehicles";
import logoDark from "@/assets/logo-jhl-dark.png";
import VehicleCompareSelector from "@/components/VehicleCompareSelector";

interface VehicleRow {
  id: string;
  slug: string;
  brand: string;
  name: string;
  type: string;
  year: number;
  price_public: number;
  price_employee?: number;
  mileage: string;
  img: string;
  images: string[];
  status: string;
  location: string;
  description: string;
  is_public: boolean;
}

function parseMileage(m: string): number | null {
  const match = m.replace(/,/g, "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const { isEmployee, user, signOut } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const slugA = params.get("a");
  const slugB = params.get("b");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      if (isEmployee) {
        const { data } = await supabase.from("vehicles").select("*");
        setVehicles((data as unknown as VehicleRow[]) || []);
      } else {
        const { data } = await supabase.from("vehicles_public" as any).select("*");
        setVehicles((data as unknown as VehicleRow[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [isEmployee]);

  const vehicleA = useMemo(() => vehicles.find((v) => v.slug === slugA) || null, [vehicles, slugA]);
  const vehicleB = useMemo(() => vehicles.find((v) => v.slug === slugB) || null, [vehicles, slugB]);

  const setSlug = (key: "a" | "b", slug: string) => {
    const p = new URLSearchParams(params);
    p.set(key, slug);
    setParams(p, { replace: true });
  };

  const getPrice = (v: VehicleRow) =>
    isEmployee && v.price_employee ? v.price_employee : v.price_public;

  // Auto-generated insights
  const insights = useMemo(() => {
    if (!vehicleA || !vehicleB) return [];
    const notes: { text: string }[] = [];

    // Price
    const pA = getPrice(vehicleA);
    const pB = getPrice(vehicleB);
    if (pA !== pB) {
      const cheaper = pA < pB ? vehicleA : vehicleB;
      const diff = Math.abs(pA - pB);
      notes.push({ text: `${cheaper.name} es $${fmt(diff)} más económico` });
    } else {
      notes.push({ text: "Ambos tienen el mismo precio" });
    }

    // Year
    if (vehicleA.year !== vehicleB.year) {
      const newer = vehicleA.year > vehicleB.year ? vehicleA : vehicleB;
      const diff = Math.abs(vehicleA.year - vehicleB.year);
      notes.push({ text: `${newer.name} es ${diff} año${diff > 1 ? "s" : ""} más reciente` });
    } else {
      notes.push({ text: `Ambos son modelo ${vehicleA.year}` });
    }

    // Mileage
    const kmA = parseMileage(vehicleA.mileage);
    const kmB = parseMileage(vehicleB.mileage);
    if (kmA !== null && kmB !== null && kmA !== kmB) {
      const less = kmA < kmB ? vehicleA : vehicleB;
      const diff = Math.abs(kmA - kmB);
      notes.push({ text: `${less.name} tiene ${fmt(diff)} km menos` });
    } else if (kmA !== null && kmB !== null) {
      notes.push({ text: "Ambos tienen kilometraje similar" });
    }

    // Type
    if (vehicleA.type === vehicleB.type) {
      notes.push({ text: `Ambos son ${vehicleA.type}` });
    } else {
      notes.push({ text: `${vehicleA.name} es ${vehicleA.type}, ${vehicleB.name} es ${vehicleB.type}` });
    }

    // Location
    if (vehicleA.location === vehicleB.location) {
      notes.push({ text: `Ambos están en ${vehicleA.location}` });
    } else {
      notes.push({ text: `Ubicaciones diferentes: ${vehicleA.location} vs ${vehicleB.location}` });
    }

    return notes;
  }, [vehicleA, vehicleB, isEmployee]);

  const specRows = useMemo(() => {
    if (!vehicleA || !vehicleB) return [];
    return [
      { label: "Precio", a: `$${fmt(getPrice(vehicleA))}`, b: `$${fmt(getPrice(vehicleB))}` },
      { label: "Año", a: String(vehicleA.year), b: String(vehicleB.year) },
      { label: "Kilometraje", a: vehicleA.mileage, b: vehicleB.mileage },
      { label: "Tipo", a: vehicleA.type, b: vehicleB.type },
      { label: "Marca", a: vehicleA.brand, b: vehicleB.brand },
      { label: "Ubicación", a: vehicleA.location, b: vehicleB.location },
      { label: "Estatus", a: vehicleA.status, b: vehicleB.status },
    ];
  }, [vehicleA, vehicleB, isEmployee]);

  return (
    <div className="min-h-screen bg-background p-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div className="max-w-screen-xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-12 px-3">
          <Link to="/">
            <img src={logoDark} alt="JH Leasing" className="h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/inventario"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Inventario
            </Link>
            {user ? (
              <button
                onClick={() => signOut()}
                className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
              >
                Salir
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>

        {/* TITLE */}
        <div className="text-center mb-12">
          <h1 className="heading-xl mb-2">Comparar Vehículos</h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Selecciona dos vehículos para ver una comparativa detallada
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>Cargando inventario...</p>
          </div>
        ) : (
          <>
            {/* SELECTORS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <VehicleCompareSelector
                vehicles={vehicles}
                selected={slugA}
                onSelect={(s) => setSlug("a", s)}
                excludeSlug={slugB}
                label="Vehículo A"
              />
              <VehicleCompareSelector
                vehicles={vehicles}
                selected={slugB}
                onSelect={(s) => setSlug("b", s)}
                excludeSlug={slugA}
                label="Vehículo B"
              />
            </div>

            {/* COMPARISON */}
            {vehicleA && vehicleB ? (
              <div className="space-y-8">
                {/* Images side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[vehicleA, vehicleB].map((v) => (
                    <Link key={v.slug} to={`/vehiculo/${v.slug}`} className="block">
                      <div className="neu-card overflow-hidden group">
                        <img
                          src={v.img}
                          alt={v.name}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="p-6">
                          <span className="label-micro">{v.type}</span>
                          <h2 className="heading-md mt-1">{v.name}</h2>
                          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{v.year}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Specs table */}
                <div className="neu-card">
                  <div className="p-8 md:p-10">
                    <span className="label-micro block mb-6">Comparativa</span>
                    <div className="space-y-0">
                      {/* Header row */}
                      <div className="grid grid-cols-3 gap-4 pb-4 mb-4" style={{ borderBottom: "2px solid hsl(var(--border))" }}>
                        <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>
                          Métrica
                        </span>
                        <span className="text-xs uppercase tracking-widest font-bold text-center" style={{ color: "hsl(var(--primary))" }}>
                          {vehicleA.name}
                        </span>
                        <span className="text-xs uppercase tracking-widest font-bold text-center" style={{ color: "hsl(var(--primary))" }}>
                          {vehicleB.name}
                        </span>
                      </div>
                      {specRows.map((row) => {
                        const highlight = row.a !== row.b;
                        return (
                          <div
                            key={row.label}
                            className="grid grid-cols-3 gap-4 py-4"
                            style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}
                          >
                            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
                              {row.label}
                            </span>
                            <span className={`text-sm font-semibold text-center ${highlight ? "" : ""}`}>
                              {row.a}
                            </span>
                            <span className={`text-sm font-semibold text-center ${highlight ? "" : ""}`}>
                              {row.b}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="neu-accent">
                  <div className="p-8 md:p-10">
                    <span className="label-micro block mb-6">Conclusiones</span>
                    <div className="space-y-4">
                      {insights.map((note, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "hsl(var(--foreground))" }} />
                          <p className="text-sm leading-relaxed">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="neu-card p-16 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <rect x="2" y="3" width="8" height="18" rx="2" />
                  <rect x="14" y="3" width="8" height="18" rx="2" />
                  <path d="M10 12h4" />
                </svg>
                <p className="heading-md mb-2">Selecciona dos vehículos</p>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Usa los selectores de arriba para elegir los vehículos que deseas comparar
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
