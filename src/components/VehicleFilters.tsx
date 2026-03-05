import { fmt } from "@/data/vehicles";
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

interface Props {
  typeFilters: string[];
  brandFilters: string[];
  activeType: string;
  setActiveType: (t: string) => void;
  activeBrand: string[];
  toggleBrand: (b: string) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
  priceMin: number;
  priceMax: number;
}

export default function VehicleFilters({
  typeFilters, brandFilters, activeType, setActiveType,
  activeBrand, toggleBrand, maxPrice, setMaxPrice,
  priceMin, priceMax,
}: Props) {
  const range = priceMax - priceMin || 1;
  return (
    <div className="col-span-12 lg:col-span-3 neu-card h-fit">
      <div className="p-10">
        <div className="mb-8">
          <span className="label-micro mb-3 block">Tipo de Vehículo</span>
          <div className="flex flex-wrap gap-3 mt-3">
            {typeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveType(f)}
                className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all ${
                  activeType === f ? "neu-inset-sm" : "neu-tag"
                }`}
                style={activeType === f ? { color: "hsl(var(--primary))" } : {}}
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
          <div className="flex justify-between text-xs mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            <span>${fmt(priceMin)}</span>
            <span>${fmt(priceMax)}</span>
          </div>
        </div>

        <div>
          <span className="label-micro mb-3 block">Marca</span>
          <div className="flex flex-wrap gap-3 mt-3">
            {brandFilters.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`p-3 rounded-xl transition-all flex items-center justify-center w-16 h-16 ${
                  activeBrand.includes(b) ? "neu-inset-sm" : "neu-tag"
                }`}
                title={b}
              >
                {brandLogos[b] ? (
                  <img
                    src={brandLogos[b]}
                    alt={b}
                    className="h-6 w-auto object-contain"
                    style={activeBrand.includes(b) ? { filter: "none" } : { filter: "grayscale(100%) opacity(0.5)" }}
                  />
                ) : (
                  <span className="text-[11px] uppercase tracking-widest font-semibold">{b}</span>
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
              { step: "01", title: "Selección", desc: "Elige tu vehículo del inventario disponible" },
              { step: "02", title: "Cotización", desc: "Recibe precio final sin sorpresas" },
              { step: "03", title: "Aprobación", desc: "Valida documentación y forma de pago" },
              { step: "04", title: "Entrega", desc: "Recoge tu vehículo listo para rodar" },
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
      </div>
    </div>
  );
}
