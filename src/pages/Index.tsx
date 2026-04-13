import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVehicles } from "@/hooks/useVehicles";
import { getDisplayPrice } from "@/lib/format";
import type { VehicleRow } from "@/types/vehicle";
import heroVideo from "@/assets/hero-video.mp4";
import logoHorizontal from "@/assets/logo-jhl-horizontal.png";
import logoIcon from "@/assets/logo-jhl-icon.png";
import HeroSection from "@/components/HeroSection";
import VehicleFilters from "@/components/VehicleFilters";
import VehicleCard from "@/components/VehicleCard";
import FooterSection from "@/components/FooterSection";
import { useCustomBrandLogos } from "@/hooks/useCustomBrandLogos";

export default function Index() {
  const { user, role, isEmployee, isLoading, signOut } = useAuth();
  const { vehicles, loading: loadingVehicles } = useVehicles(isEmployee, isLoading);
  const { allBrandLogos } = useCustomBrandLogos();

  const [activeType, setActiveType] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [showFilters, setShowFilters] = useState(false);

  const typeFilters = ["Todos", "Sedán", "SUV", "Blindados"];
  const brandFilters = [...new Set(vehicles.map(v => v.brand))].sort();

  const toggleBrand = (brand: string) => {
    setActiveBrand((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const prices = vehicles.map(v => getDisplayPrice(v, isEmployee));
  const priceMin = prices.length ? Math.floor(Math.min(...prices) / 10000) * 10000 : 100000;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 1200000;

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = activeType === "Todos" || (activeType === "Blindados" ? v.is_armored : v.type === activeType);
    const matchesBrand = activeBrand.length === 0 || activeBrand.includes(v.brand);
    const matchesPrice = getDisplayPrice(v, isEmployee) <= maxPrice;
    return matchesType && matchesBrand && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-screen-2xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-8 md:mb-16 px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-secondary">
          <img src={logoHorizontal} alt="JH Leasing" className="h-10 md:h-16 w-auto" />
          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <>
                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 md:px-5 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {isEmployee && role && (
                  <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 md:px-3 py-1 rounded-full bg-primary text-primary-foreground">
                    {role === "admin" ? "Admin" : role === "employee" ? "Empleado" : "Usuario"}
                  </span>
                )}
                <button
                  onClick={() => signOut()}
                  className="px-3 md:px-5 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-semibold bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 md:px-5 py-2 md:py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>

        <HeroSection heroVideo={heroVideo} />

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full py-3 rounded-2xl text-xs uppercase tracking-widest font-bold neu-card flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M6 12h12M8 18h8" />
            </svg>
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
        </div>

        {/* FILTER + VEHICLES */}
        <section className="grid grid-cols-12 gap-4 md:gap-6 mb-12 md:mb-24">
          <div className={`col-span-12 lg:col-span-3 ${showFilters ? "block" : "hidden lg:block"}`}>
            <VehicleFilters
              typeFilters={typeFilters}
              brandFilters={brandFilters}
              brandLogos={allBrandLogos}
              activeType={activeType}
              setActiveType={setActiveType}
              activeBrand={activeBrand}
              toggleBrand={toggleBrand}
              maxPrice={maxPrice > priceMax ? priceMax : maxPrice}
              setMaxPrice={setMaxPrice}
              priceMin={priceMin}
              priceMax={priceMax}
              vehicles={vehicles}
              isEmployee={isEmployee}
            />
          </div>

          {/* Vehicle Grid */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {loadingVehicles ? (
              <div className="col-span-full flex items-center justify-center py-24">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando inventario...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                <p className="text-2xl mb-2 uppercase font-light">Sin resultados</p>
                <p className="text-sm">Prueba ajustando los filtros</p>
              </div>
            ) : (
              filteredVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isEmployee={isEmployee} displayPrice={getDisplayPrice(v, isEmployee)} />
              ))
            )}
          </div>
        </section>

        <FooterSection logoIcon={logoIcon} logoHorizontal={logoHorizontal} />
      </div>
    </div>
  );
}
