import { useState, useRef, useEffect } from "react";

interface VehicleOption {
  slug: string;
  name: string;
  year: number;
  img: string;
  brand: string;
}

interface Props {
  vehicles: VehicleOption[];
  selected: string | null;
  onSelect: (slug: string) => void;
  excludeSlug?: string | null;
  label: string;
}

export default function VehicleCompareSelector({ vehicles, selected, onSelect, excludeSlug, label }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.slug !== excludeSlug &&
      (v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.brand.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedVehicle = vehicles.find((v) => v.slug === selected);

  return (
    <div ref={ref} className="relative w-full">
      <span className="label-micro block mb-2">{label}</span>
      <button
        onClick={() => setOpen(!open)}
        className="neu-card w-full text-left transition-all hover:scale-[1.01]"
      >
        <div className="p-4 flex items-center gap-4">
          {selectedVehicle ? (
            <>
              <img
                src={selectedVehicle.img}
                alt={selectedVehicle.name}
                className="w-16 h-12 object-cover rounded-xl"
              />
              <div>
                <p className="text-sm font-semibold">{selectedVehicle.name}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {selectedVehicle.year} · {selectedVehicle.brand}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 py-1">
              <div className="w-16 h-12 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--card))" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                Seleccionar vehículo...
              </span>
            </div>
          )}
          <svg
            className="ml-auto shrink-0 transition-transform"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "hsl(var(--muted-foreground))" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden"
          style={{
            background: "hsl(var(--background))",
            boxShadow: "var(--shadow-raised)",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div className="p-3">
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
            />
          </div>
          <div className="max-h-64 overflow-y-auto px-2 pb-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                No se encontraron vehículos
              </p>
            ) : (
              filtered.map((v) => (
                <button
                  key={v.slug}
                  onClick={() => {
                    onSelect(v.slug);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.01] ${
                    v.slug === selected ? "ring-2 ring-primary" : ""
                  }`}
                  style={{
                    background: v.slug === selected ? "hsl(var(--card))" : "transparent",
                  }}
                >
                  <img src={v.img} alt={v.name} className="w-14 h-10 object-cover rounded-lg" />
                  <div>
                    <p className="text-sm font-semibold">{v.name}</p>
                    <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {v.year} · {v.brand}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
