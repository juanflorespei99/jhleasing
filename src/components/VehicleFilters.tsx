import { fmt } from "@/data/vehicles";

interface Props {
  typeFilters: string[];
  brandFilters: string[];
  activeType: string;
  setActiveType: (t: string) => void;
  activeBrand: string[];
  toggleBrand: (b: string) => void;
  maxPrice: number;
  setMaxPrice: (p: number) => void;
}

export default function VehicleFilters({
  typeFilters, brandFilters, activeType, setActiveType,
  activeBrand, toggleBrand, maxPrice, setMaxPrice,
}: Props) {
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
            min={100000}
            max={1200000}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full mt-4 appearance-none h-3 rounded-full outline-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((maxPrice - 100000) / 1100000) * 100}%, hsl(var(--background)) ${((maxPrice - 100000) / 1100000) * 100}%, hsl(var(--background)) 100%)`,
              boxShadow: "inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff",
            }}
          />
          <div className="flex justify-between text-xs mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            <span>${fmt(100000)}</span>
            <span>${fmt(1200000)}</span>
          </div>
        </div>

        <div>
          <span className="label-micro mb-3 block">Marca</span>
          <div className="flex flex-wrap gap-3 mt-3">
            {brandFilters.map((b) => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-all ${
                  activeBrand.includes(b) ? "neu-inset-sm" : "neu-tag"
                }`}
                style={activeBrand.includes(b) ? { color: "hsl(var(--primary))" } : {}}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
