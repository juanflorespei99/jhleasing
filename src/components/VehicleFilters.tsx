import { fmt, getDisplayPrice } from "@/lib/format";
import type { VehicleRow } from "@/types/vehicle";
import MiniCompare from "@/components/MiniCompare";

interface Props {
  typeFilters: string[];
  brandFilters: string[];
  brandLogos: Record<string, string>;
  activeType: string;
  setActiveType: (t: string) => void;
  activeBrand: string[];
  toggleBrand: (b: string) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  priceMin: number;
  priceMax: number;
  vehicles: VehicleRow[];
  isEmployee: boolean;
}

export default function VehicleFilters({
  typeFilters, brandFilters, brandLogos, activeType, setActiveType,
  activeBrand, toggleBrand, maxPrice, setMaxPrice,
  priceMin, priceMax, vehicles, isEmployee,
}: Props) {
  const range = priceMax - priceMin || 1;
  return (
    <div className="neu-card h-fit overflow-visible">
      <div className="p-6 md:p-10">
        <div className="mb-8">
          <span className="label-micro mb-3 block">Tipo de Vehículo</span>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-3">
            {typeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveType(f)}
                className={`px-3 md:px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all ${
                  activeType === f ? "neu-inset-sm text-primary" : "neu-tag"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <span className="label-micro mb-3 block">Precio Máximo — ${fmt(maxPrice)}</span>
          <input
            type="range"
            min={priceMin}
            max={priceMax}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full mt-4 appearance-none h-3 rounded-full outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((maxPrice - priceMin) / range) * 100}%, hsl(var(--background)) ${((maxPrice - priceMin) / range) * 100}%, hsl(var(--background)) 100%)`,
              boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff",
            }}
          />
          <div className="flex justify-between text-xs mt-3 text-muted-foreground">
            <span>${fmt(priceMin)}</span>
            <span>${fmt(priceMax)}</span>
          </div>
        </div>

        <div>
          <span className="label-micro mb-3 block">Marca</span>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-3">
            {brandFilters.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`p-2 md:p-3 rounded-xl transition-all flex items-center justify-center w-12 h-12 md:w-16 md:h-16 ${
                  activeBrand.includes(b) ? "neu-inset-sm" : "neu-tag"
                }`}
                title={b}
              >
                {brandLogos[b] ? (
                  <img
                    src={brandLogos[b]}
                    alt={b}
                    className="h-5 md:h-6 w-auto object-contain"
                    style={activeBrand.includes(b) ? { filter: "none" } : { filter: "grayscale(100%) opacity(0.5)" }}
                  />
                ) : (
                  <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-semibold">{b}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Steps Process */}
        <div className="mt-10 pt-8 border-t border-border">
          <span className="label-micro mb-5 block">Cómo Comprar</span>
          <div className="space-y-5">
            {[
              { step: "01", title: "Selecciona", desc: "Explora nuestro inventario y elige el vehículo que más se adapte a tus necesidades" },
              { step: "02", title: "Envía tus datos", desc: "Llena el formulario de solicitud de compra con tu información de contacto" },
              { step: "03", title: "Te contactamos", desc: "Nuestro equipo se comunicará contigo para confirmar disponibilidad, resolver dudas y coordinar el pago" },
              { step: "04", title: "Pago y Entrega", desc: "Realiza tu pago de forma segura y recoge tu vehículo listo para rodar" },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="text-2xl font-extralight text-primary leading-none mt-0.5">{s.step}</span>
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-foreground">{s.title}</p>
                  <p className="text-[11px] mt-1 text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Comparador */}
        <div className="mt-10 pt-8 border-t border-border">
          <MiniCompare vehicles={vehicles} isEmployee={isEmployee} />
        </div>
      </div>
    </div>
  );
}
