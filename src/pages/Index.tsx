import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fmt } from "@/data/vehicles";
import heroVideo from "@/assets/hero-video.mp4";
import logoHorizontal from "@/assets/logo-jhl-horizontal.png";
import logoIcon from "@/assets/logo-jhl-icon.png";
import HeroSection from "@/components/HeroSection";
import VehicleFilters from "@/components/VehicleFilters";
import VehicleCard from "@/components/VehicleCard";
import TestimonialsSection from "@/components/TestimonialsSection";
import FooterSection from "@/components/FooterSection";

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
  vin?: string;
  location: string;
  description: string;
  is_public: boolean;
}

export default function Index() {
  const { user, role, isEmployee, isLoading, signOut } = useAuth();
  
  const [activeType, setActiveType] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const typeFilters = ["Todos", "Sedán", "SUV", "Blindada"];
  const brandFilters = ["Chevrolet", "Hyundai", "Nissan", "GMC", "MG", "Dodge"];
  

  useEffect(() => {
    fetchVehicles();
  }, [isEmployee, isLoading]);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      if (isEmployee) {
        // Employees see all vehicles with all fields
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) setVehicles(data as unknown as VehicleRow[]);
      } else {
        // Public users see only public vehicles via the view (no price_employee, no vin)
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

  const toggleBrand = (brand: string) => {
    setActiveBrand((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const displayPrice = (v: VehicleRow) => isEmployee && v.price_employee ? v.price_employee : v.price_public;

  const prices = vehicles.map(displayPrice);
  const priceMin = prices.length ? Math.floor(Math.min(...prices) / 10000) * 10000 : 100000;
  const priceMax = prices.length ? Math.ceil(Math.max(...prices) / 10000) * 10000 : 1200000;

  const filteredVehicles = vehicles.filter((v) => {
    const matchesType = activeType === "Todos" || v.type === activeType;
    const matchesBrand = activeBrand.length === 0 || activeBrand.includes(v.brand);
    const matchesPrice = displayPrice(v) <= maxPrice;
    return matchesType && matchesBrand && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background p-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div className="max-w-screen-2xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-16 px-3">
          <img src={logoHorizontal} alt="JH Leasing" className="h-20 w-auto" />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
                  >
                    Admin
                  </Link>
                )}
                {isEmployee && (
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full"
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  >
                    Empleado
                  </span>
                )}
                <button
                  onClick={() => signOut()}
                  className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
                >
                  Salir
                </button>
              </>
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

        <HeroSection heroVideo={heroVideo} />

        {/* FILTER + VEHICLES */}
        <section className="grid grid-cols-12 gap-6 mb-24">
          <VehicleFilters
            typeFilters={typeFilters}
            brandFilters={brandFilters}
            activeType={activeType}
            setActiveType={setActiveType}
            activeBrand={activeBrand}
            toggleBrand={toggleBrand}
            maxPrice={maxPrice > priceMax ? priceMax : maxPrice}
            setMaxPrice={setMaxPrice}
            priceMin={priceMin}
            priceMax={priceMax}
          />

          {/* Vehicle Grid */}
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loadingVehicles ? (
              <div className="col-span-3 flex items-center justify-center py-24">
                <p className="text-sm uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))" }}>Cargando inventario...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-24 text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                <p className="text-2xl mb-2 uppercase font-light">Sin resultados</p>
                <p className="text-sm">Prueba ajustando los filtros</p>
              </div>
            ) : (
              filteredVehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} isEmployee={isEmployee} displayPrice={displayPrice(v)} />
              ))
            )}
          </div>
        </section>

        {/* PROMO BANNER */}
        <section className="mb-20">
          <div className="neu-accent">
            <div className="p-16 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <span className="label-micro mb-3 block" style={{ color: "rgba(0,0,0,0.6)" }}>Tiempo Limitado</span>
                <h2 className="heading-lg">Oferta Especial<br />de Temporada</h2>
              </div>
              <div className="text-center md:text-right">
                <span className="label-micro mb-3 block" style={{ color: "rgba(0,0,0,0.6)" }}>Termina</span>
                <p className="text-5xl font-light uppercase">31 Mar</p>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />
        <FooterSection logoIcon={logoIcon} logoHorizontal={logoHorizontal} />
      </div>
    </div>
  );
}
