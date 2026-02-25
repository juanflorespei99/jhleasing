import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { vehicles, fmt } from "@/data/vehicles";
import logoHorizontal from "@/assets/logo-jhl-horizontal.png";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicle = vehicles.find((v) => v.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="neu-card p-16 text-center">
          <p className="heading-md mb-4">Vehículo no encontrado</p>
          <Link
            to="/"
            className="inline-block px-8 py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: "Año", value: String(vehicle.year) },
    { label: "Kilometraje", value: vehicle.mileage },
    { label: "Tipo", value: vehicle.type },
    { label: "Ubicación", value: vehicle.location },
    
    { label: "Estatus", value: vehicle.status },
  ];

  return (
    <div className="min-h-screen bg-background p-6" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div className="max-w-screen-2xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-12 px-3">
          <Link to="/">
            <img src={logoHorizontal} alt="JH Leasing" className="h-20 w-auto" />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Catálogo
          </Link>
        </nav>

        {/* MAIN */}
        <div className="grid grid-cols-12 gap-6 mb-16">

          {/* IMAGE GALLERY */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            <div className="neu-card overflow-hidden relative">
              <img
                src={vehicle.images[activeImage]}
                alt={`${vehicle.name} - imagen ${activeImage + 1}`}
                className="w-full object-cover transition-opacity duration-300"
                style={{ height: "clamp(320px, 40vw, 520px)" }}
              />
              {/* Prev / Next arrows */}
              {vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p === 0 ? vehicle.images.length - 1 : p - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-70"
                    style={{ background: "rgba(234,234,234,0.85)", boxShadow: "var(--shadow-tag)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p === vehicle.images.length - 1 ? 0 : p + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-70"
                    style={{ background: "rgba(234,234,234,0.85)", boxShadow: "var(--shadow-tag)" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </>
              )}
              {/* Counter */}
              <span
                className="absolute bottom-4 right-4 text-[11px] uppercase tracking-widest font-bold px-4 py-2 rounded-full"
                style={{ background: "rgba(234,234,234,0.85)", boxShadow: "var(--shadow-tag)" }}
              >
                {activeImage + 1} / {vehicle.images.length}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {vehicle.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-1 rounded-2xl overflow-hidden transition-all duration-200 ${
                    i === activeImage ? "neu-inset-sm ring-2" : "neu-card opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    height: 80,
                    ...(i === activeImage ? { ringColor: "hsl(var(--primary))" } : {}),
                  }}
                >
                  <img src={img} alt={`${vehicle.name} miniatura ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO SIDEBAR */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">

            {/* Header + Price */}
            <div className="neu-card">
              <div className="p-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-micro">{vehicle.type}</span>
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full"
                    style={{
                      background: vehicle.status === "Disponible" ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      color: vehicle.status === "Disponible" ? "hsl(var(--primary-foreground))" : "hsl(var(--background))",
                    }}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <h1 className="heading-xl mb-1">{vehicle.name}</h1>
                <p className="text-sm mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>{vehicle.year}</p>

                <span className="label-micro block mb-1">Precio Total</span>
                <p className="text-4xl font-light mb-8">${fmt(vehicle.price)}</p>

                <button
                  className="w-full py-5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  Solicitar Compra
                </button>
                <button
                  className="mt-3 w-full py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200"
                  style={{ boxShadow: "6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff", background: "transparent" }}
                >
                  Solicitar Información
                </button>
              </div>
            </div>

            {/* Specs */}
            <div className="neu-card">
              <div className="p-10">
                <span className="label-micro block mb-6">Información del Vehículo</span>
                <div className="space-y-5">
                  {specs.map((s) => (
                    <div key={s.label} className="flex justify-between items-center border-b pb-4" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                      <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {s.label}
                      </span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <section className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 lg:col-span-7">
            <div className="neu-card">
              <div className="p-10">
                <span className="label-micro block mb-4">Descripción</span>
                <p className="text-base leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {vehicle.description}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="neu-accent">
              <div className="p-10 flex flex-col items-center justify-center text-center gap-4" style={{ minHeight: 200 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-xs uppercase tracking-widest font-bold">¿Tienes preguntas?</span>
                <span className="heading-md">Contáctanos</span>
                <p className="text-sm" style={{ opacity: 0.7 }}>1-800-JH-LEASE</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
