import { Link } from "react-router-dom";
import { fmt } from "@/lib/format";
import type { VehicleRow } from "@/types/vehicle";

interface Props {
  vehicle: VehicleRow;
  isEmployee: boolean;
  displayPrice: number;
}

export default function VehicleCard({ vehicle: v, isEmployee, displayPrice }: Props) {
  return (
    <Link to={`/vehiculo/${v.slug}`} className="neu-card transition-transform duration-300 hover:-translate-y-2 cursor-pointer block max-w-sm w-full">
      <div className="p-5 md:p-8 h-full flex flex-col" style={{ minHeight: 380 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="label-micro">{v.type}</span>
            {v.is_armored && (
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 md:px-3 py-1 rounded-full bg-accent text-accent-foreground">
                Blindado
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {isEmployee && !v.is_public && (
              <span
                className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 md:px-3 py-1 rounded-full bg-destructive text-destructive-foreground"
              >
                Exclusivo
              </span>
            )}
            <span
              className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-2 md:px-3 py-1 rounded-full bg-primary text-primary-foreground"
            >
              {v.status}
            </span>
          </div>
        </div>
        <h3 className="text-lg md:text-2xl font-normal uppercase mb-1">{v.name}</h3>
        <p className="text-xs mb-3 md:mb-4 text-muted-foreground">{v.year}</p>

        <div
          className="rounded-2xl md:rounded-3xl mb-4 md:mb-6 overflow-hidden"
          style={{ minHeight: 140, maxHeight: 220, boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)" }}
        >
          <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 border-t border-border/20 mt-auto pt-4 md:pt-5">
          <div>
            {isEmployee && v.price_employee ? (
              <>
                <span className="label-micro text-primary">Precio Preferencial</span>
                <p className="text-xl md:text-2xl font-light">${fmt(v.price_employee)}</p>
                {v.is_public && (
                  <p className="text-xs line-through text-muted-foreground">
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

        <span className="mt-4 md:mt-5 w-full py-3 md:py-4 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold text-center block bg-primary text-primary-foreground">
          Ver Detalles
        </span>
      </div>
    </Link>
  );
}
