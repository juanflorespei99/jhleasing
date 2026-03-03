import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fmt } from "@/data/vehicles";
import logoHorizontal from "@/assets/logo-jhl-horizontal.png";
import VehicleCard from "@/components/VehicleCard";

import chevroletLogo from "@/assets/brands/chevrolet.svg";
import hyundaiLogo from "@/assets/brands/hyundai.svg";
import nissanLogo from "@/assets/brands/nissan.svg";
import gmcLogo from "@/assets/brands/gmc.svg";
import mgLogo from "@/assets/brands/mg.svg";
import dodgeLogo from "@/assets/brands/dodge.svg";

const brandLogos: Record<string, string> = {
  Chevrolet: chevroletLogo,
  Hyundai: hyundaiLogo,
  Nissan: nissanLogo,
  GMC: gmcLogo,
  MG: mgLogo,
  Dodge: dodgeLogo,
};

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
  is_public: boolean;
}

const typeFilters = ["Todos", "Sedán", "SUV", "Blindada"];
const brandFilters = ["Chevrolet", "Hyundai", "Nissan", "GMC", "MG", "Dodge"];

export default function Inventory() {
  const { user, role, isEmployee, isLoading, signOut } = useAuth();

  const [activeType, setActiveType] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [isEmployee, isLoading]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      if (isEmployee) {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) setVehicles(data as unknown as VehicleRow[]);
      } else {
        const { data, error } = await supabase
          .from("vehicles_public" as any)
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) setVehicles(data as unknown as VehicleRow[]);
      }
    } catch (e) {
      console.error("Error fetching vehicles:", e);
    }
    setLoadingVehicles(false);
  };

  const displayPrice = (v: VehicleRow) =>
    isEmployee && v.price_employee ? v.price_employee : v.price_public;

  const prices = vehicles.map(displayPrice);
  const priceMin = prices.length ? Math.floor(Math.min(...prices) / 10000) * 10000 : 100000;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 1200000;

  const toggleBrand = (brand: string) => {
    setActiveBrand((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesType = activeType === "Todos" || v.type === activeType;
      const matchesBrand = activeBrand.length === 0 || activeBrand.includes(v.brand);
      const matchesPrice = displayPrice(v) <= maxPrice;
      return matchesType && matchesBrand && matchesPrice;
    });
  }, [vehicles, activeType, activeBrand, maxPrice, isEmployee]);

  const range = priceMax - priceMin || 1;
  const currentMax = maxPrice > priceMax ? priceMax : maxPrice;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* NAV */}
      <nav className="flex justify-between items-center px-6 py-4 bg-secondary">
        <Link to="/">
          <img src={logoHorizontal} alt="JH Leasing" className="h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 transition-colors"
                >
                  Admin
                </Link>
              )}
              {isEmployee && (
                <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                  Empleado
                </span>
              )}
              <button
                onClick={() => signOut()}
                className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 transition-colors"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>

      {/* STICKY FILTERS BAR */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-6 py-5">
          {/* Type tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {typeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveType(f)}
                className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all ${
                  activeType === f
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f}
              </button>
            ))}

            <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

            {/* Brands */}
            {brandFilters.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`p-2 rounded-xl transition-all flex items-center justify-center w-12 h-12 ${
                  activeBrand.includes(b) ? "neu-inset-sm" : "neu-tag"
                }`}
                title={b}
              >
                {brandLogos[b] ? (
                  <img
                    src={brandLogos[b]}
                    alt={b}
                    className="h-5 w-auto object-contain"
                    style={
                      activeBrand.includes(b)
                        ? { filter: "none" }
                        : { filter: "grayscale(100%) opacity(0.5)" }
                    }
                  />
                ) : (
                  <span className="text-[10px] uppercase tracking-widest font-semibold">{b}</span>
                )}
              </button>
            ))}

            <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

            {/* Price slider inline */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground whitespace-nowrap">
                Máx: ${fmt(currentMax)}
              </span>
              <input
                type="range"
                min={priceMin}
                max={priceMax}
                step={10000}
                value={currentMax}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-40 appearance-none h-2 rounded-full outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((currentMax - priceMin) / range) * 100}%, hsl(var(--muted)) ${((currentMax - priceMin) / range) * 100}%, hsl(var(--muted)) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {filteredVehicles.length} vehículo{filteredVehicles.length !== 1 ? "s" : ""} encontrado{filteredVehicles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* VEHICLE GRID - dense masonry-like layout */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {loadingVehicles ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Cargando inventario...
            </p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <p className="text-2xl mb-2 uppercase font-light">Sin resultados</p>
            <p className="text-sm">Prueba ajustando los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredVehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isEmployee={isEmployee}
                displayPrice={displayPrice(v)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
