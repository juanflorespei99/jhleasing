import { Link } from "react-router-dom";
import { fmt } from "@/data/vehicles";

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
  status: string;
  is_public: boolean;
}

interface Props {
  vehicle: VehicleRow;
  isEmployee: boolean;
  displayPrice: number;
}

export default function VehicleCard({ vehicle: v, isEmployee, displayPrice }: Props) {
  return (
    <Link to={`/vehiculo/${v.slug}`} className="neu-card transition-transform duration-300 hover:-translate-y-2 cursor-pointer block">
      <div className="p-5 md:p-8 h-full flex flex-col" style={{ minHeight: 380 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="label-micro">{v.type}</span>
          <div className="flex gap-2">
            {isEmployee && !v.is_public && (
              <span
                className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 md:px-3 py-1 rounded-full"
                style={{ background: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" }}
              >
                Exclusivo
              </span>
            )}
            <span
              className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 md:px-3 py-1 rounded-full"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              {v.status}
            </span>
          </div>
        </div>
        <h3 className="text-lg md:text-2xl font-normal uppercase mb-1">{v.name}</h3>
        <p className="text-xs mb-3 md:mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>{v.year}</p>

        <div
          className="rounded-2xl md:rounded-3xl mb-4 md:mb-6 overflow-hidden flex-grow"
          style={{ minHeight: 140, boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)" }}
        >
          <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 border-t mt-auto pt-4 md:pt-5" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <div>
            {isEmployee && v.price_employee ? (
              <>
                <span className="label-micro" style={{ color: "hsl(var(--primary))" }}>Precio Preferencial</span>
                <p className="text-xl md:text-2xl font-light">${fmt(v.price_employee)}</p>
                {v.is_public && (
                  <p className="text-xs line-through" style={{ color: "hsl(var(--muted-foreground))" }}>
                    ${fmt(v.price_public)}
                  </p>
                )}
              </>
            ) : (
              <>
                <span className="label-micro">Precio Total</span>
                <p className="text-xl md:text-2xl font-light">${fmt(v.price_public)}</p>
              </>
            )}
          </div>
          <div>
            <span className="label-micro">Kilometraje</span>
            <p className="text-sm font-semibold">{v.mileage}</p>
          </div>
        </div>

        <span
          className="mt-4 md:mt-5 w-full py-3 md:py-4 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold text-center block"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          Ver Detalles
        </span>
      </div>
    </Link>
  );
}
