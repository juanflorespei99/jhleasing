import { Link } from "react-router-dom";

interface Props {
  heroVideo: string;
}

export default function HeroSection({ heroVideo }: Props) {
  return (
    <section className="grid grid-cols-12 gap-4 md:gap-6 mb-10 md:mb-20">
      {/* Video card */}
      <div className="col-span-12 lg:col-span-8 neu-card min-h-[280px] md:min-h-[500px] overflow-hidden relative">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
        />
        <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end" style={{ minHeight: "inherit" }}>
          <span className="label-micro mb-2">Inventario Destacado</span>
        </div>
      </div>

      {/* Right column */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6">
        <div className="neu-card flex-1">
          <div className="p-6 md:p-10 h-full flex flex-col justify-between" style={{ minHeight: 200 }}>
            <div>
              <span className="label-micro mb-3 block">Venta Directa</span>
              <h1 className="heading-xl mb-4 md:mb-6" style={{ fontSize: "clamp(28px, 3vw, 40px)", textTransform: "capitalize" }}>Vehículos de Flotilla a Precio Preferencial</h1>
            </div>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))", maxWidth: "48ch" }}>
              Adquiere vehículos usados de flotilla corporativa con precios transparentes y sin intermediarios.
            </p>
          </div>
        </div>

        <Link to="/inventario" className="bg-secondary text-secondary-foreground rounded-[32px] cursor-pointer transition-transform duration-200 hover:-translate-y-1 shadow-lg block">
          <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center gap-3" style={{ minHeight: 160 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-xs uppercase tracking-widest font-bold">Explorar</span>
            <span className="heading-md">Ver Inventario</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
