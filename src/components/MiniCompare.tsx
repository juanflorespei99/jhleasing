import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Columns2 } from "lucide-react";
import { fmt, getDisplayPrice } from "@/lib/format";
import type { VehicleRow } from "@/types/vehicle";

interface Props {
  vehicles: VehicleRow[];
  isEmployee: boolean;
}

function MiniSelector({
  vehicles,
  selected,
  onSelect,
  excludeSlug,
  label,
}: {
  vehicles: VehicleRow[];
  selected: string | null;
  onSelect: (slug: string) => void;
  excludeSlug: string | null;
  label: string;
}) {
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
      (`${v.brand} ${v.name}`.toLowerCase().includes(search.toLowerCase()))
  );

  const sel = vehicles.find((v) => v.slug === selected);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left px-3 py-2 rounded-xl text-[11px] transition-all ${
          sel ? "neu-inset-sm" : "neu-tag"
        }`}
      >
        {sel ? (
          <div className="flex items-center gap-2">
            <img src={sel.img} alt={sel.name} className="w-8 h-6 object-cover rounded-md" />
            <span className="truncate font-semibold">{sel.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{label}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute z-50 bottom-full mb-1 w-full rounded-xl overflow-hidden"
          style={{
            background: "hsl(var(--background))",
            boxShadow: "var(--shadow-raised, 0 8px 30px rgba(0,0,0,.12))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-[11px] outline-none bg-card text-foreground"
            />
          </div>
          <div className="max-h-40 overflow-y-auto px-1 pb-1">
            {filtered.length === 0 ? (
              <p className="text-[10px] text-center py-3 text-muted-foreground">Sin resultados</p>
            ) : (
              filtered.map((v) => (
                <button
                  key={v.slug}
                  onClick={() => { onSelect(v.slug); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-[11px] transition-colors hover:bg-accent/50"
                >
                  <img src={v.img} alt={v.name} className="w-8 h-6 object-cover rounded-md" />
                  <div className="truncate">
                    <span className="font-semibold">{v.name}</span>
                    <span className="text-muted-foreground ml-1">{v.year}</span>
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

export default function MiniCompare({ vehicles, isEmployee }: Props) {
  const [slugA, setSlugA] = useState<string | null>(null);
  const [slugB, setSlugB] = useState<string | null>(null);

  const vA = vehicles.find((v) => v.slug === slugA);
  const vB = vehicles.find((v) => v.slug === slugB);

  const rows = vA && vB
    ? [
        { label: "Precio", a: `$${fmt(getDisplayPrice(vA, isEmployee))}`, b: `$${fmt(getDisplayPrice(vB, isEmployee))}` },
        { label: "Año", a: String(vA.year), b: String(vB.year) },
        { label: "Km", a: vA.mileage, b: vB.mileage },
      ]
    : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Columns2 className="w-4 h-4 text-primary" />
        <span className="label-micro">Comparar Modelos</span>
      </div>

      <div className="space-y-2 mb-4">
        <MiniSelector
          vehicles={vehicles}
          selected={slugA}
          onSelect={setSlugA}
          excludeSlug={slugB}
          label="Vehículo A..."
        />
        <MiniSelector
          vehicles={vehicles}
          selected={slugB}
          onSelect={setSlugB}
          excludeSlug={slugA}
          label="Vehículo B..."
        />
      </div>

      {rows && (
        <div className="rounded-xl overflow-hidden mb-4 bg-card">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left text-muted-foreground font-medium"></th>
                <th className="p-2 text-center font-bold uppercase tracking-wider text-foreground">A</th>
                <th className="p-2 text-center font-bold uppercase tracking-wider text-foreground">B</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border last:border-0">
                  <td className="p-2 text-muted-foreground font-medium uppercase tracking-wider">{r.label}</td>
                  <td className="p-2 text-center font-semibold text-foreground">{r.a}</td>
                  <td className="p-2 text-center font-semibold text-foreground">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slugA && slugB ? (
        <Link
          to={`/comparar?a=${slugA}&b=${slugB}`}
          className="block w-full text-center px-4 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Ver completa
        </Link>
      ) : (
        <p className="text-[10px] text-muted-foreground text-center">
          Selecciona dos vehículos para comparar
        </p>
      )}
    </div>
  );
}
