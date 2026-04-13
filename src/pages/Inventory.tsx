import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useVehicles";
import { fmt, getDisplayPrice } from "@/lib/format";
import VehicleCard from "@/components/VehicleCard";
import { useCustomBrandLogos } from "@/hooks/useCustomBrandLogos";
import logoHorizontal from "@/assets/logo-jhl-horizontal.png";

const typeFilters = ["Todos", "Sedán", "SUV", "Blindados"];

export default function Inventory() {
  const { user, role, isEmployee, isLoading, signOut } = useAuth();
  const { vehicles, loading: loadingVehicles } = useVehicles(isEmployee, isLoading);
  const { allBrandLogos: brandLogos } = useCustomBrandLogos();

  const [activeType, setActiveType] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(Infinity);

  const prices = vehicles.map(v => getDisplayPrice(v, isEmployee));
  const priceMin = prices.length ? Math.floor(Math.min(...prices) / 10000) * 10000 : 100000;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 1200000;

  const brandFilters = useMemo(() => [...new Set(vehicles.map(v => v.brand))].sort(), [vehicles]);

  const toggleBrand = (brand: string) => {
    setActiveBrand((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesType = activeType === "Todos" || (activeType === "Blindados" ? v.is_armored : v.type === activeType);
      const matchesBrand = activeBrand.length === 0 || activeBrand.includes(v.brand);
      const matchesPrice = getDisplayPrice(v, isEmployee) <= maxPrice;
      return matchesType && matchesBrand && matchesPrice;
    });
  }, [vehicles, activeType, activeBrand, maxPrice, isEmployee]);

  const range = priceMax - priceMin || 1;
  const currentMax = maxPrice > priceMax ? priceMax : maxPrice;

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-secondary gap-3">
        <Link to="/" className="shrink-0">
          <img src={logoHorizontal} alt="JH Leasing" className="h-10 sm:h-14 w-auto" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
              {isEmployee && role && (
                <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                  {role === "admin" ? "Admin" : role === "employee" ? "Empleado" : "Usuario"}
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
              className="px-4 sm:px-5 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground whitespace-nowrap"
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
                  activeType === f ? "neu-inset-sm text-primary" : "neu-tag"
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
                    style={activeBrand.includes(b) ? {} : { filter: "grayscale(100%) opacity(0.5)" }}
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

      {/* VEHICLE GRID */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        {loadingVehicles ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando inventario...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
            <p className="text-2xl mb-2 uppercase font-light">Sin resultados</p>
            <p className="text-sm">Prueba ajustando los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {filteredVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} isEmployee={isEmployee} displayPrice={getDisplayPrice(v, isEmployee)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
