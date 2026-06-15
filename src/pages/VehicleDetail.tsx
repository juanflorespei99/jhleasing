import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fmt } from "@/lib/format";
import type { VehicleRow } from "@/types/vehicle";
import logoDark from "@/assets/logo-jhl-dark.png";
import ImageLightbox from "@/components/ImageLightbox";
import ScheduleVisitDialog from "@/components/ScheduleVisitDialog";
import { toast } from "sonner";
import { withVehicleImageFallback } from "@/lib/vehicleImages";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isEmployee, user, signOut } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const galleryImages = useMemo(() => {
    if (!vehicle?.images?.length) return [];
    const imgs = [...vehicle.images];
    while (imgs.length < 4) imgs.push(...vehicle.images);
    return imgs.slice(0, Math.max(4, vehicle.images.length));
  }, [vehicle?.images]);

  useEffect(() => {
    setActiveImage(0);
  }, [vehicle?.slug]);

  useEffect(() => {
    if (!id) return;
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const query = isEmployee
          ? supabase.from("vehicles_employee").select("*").eq("slug", id).maybeSingle()
          : supabase.from("vehicles_public").select("*").eq("slug", id).maybeSingle();
        const { data, error } = await query;
        if (error) throw error;
        setVehicle(withVehicleImageFallback(data as VehicleRow | null) ?? null);
      } catch {
        toast.error("Error cargando vehículo");
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [id, isEmployee]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="neu-card p-16 text-center">
          <p className="heading-md mb-4">Vehículo no encontrado</p>
          <Link
            to="/"
            className="inline-block px-8 py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const specs = [
    { label: "Año", value: String(vehicle.year) },
    { label: "Color", value: vehicle.color || "—" },
    { label: "Kilometraje", value: vehicle.mileage },
    { label: "Tipo", value: vehicle.type },
    { label: "Ubicación", value: vehicle.location },
    { label: "Placas", value: vehicle.plate_state || "—" },
    { label: "Estatus", value: vehicle.status },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-screen-2xl mx-auto">

        {/* NAV */}
        <nav className="flex justify-between items-center mb-12 px-3">
          <Link to="/">
            <img src={logoDark} alt="JH Leasing" className="h-20 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Catálogo
            </Link>
            {user ? (
              <button onClick={() => signOut()} className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-semibold neu-tag hover:opacity-70 transition-opacity">Salir</button>
            ) : (
              <Link to="/login" className="px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground">Iniciar Sesión</Link>
            )}
          </div>
        </nav>

        {/* MAIN */}
        <div className="grid grid-cols-12 gap-6 mb-16">

          {/* IMAGE GALLERY */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            <div className="neu-card overflow-hidden relative group cursor-pointer" onClick={() => setLightboxOpen(true)}>
              <img
                src={galleryImages[activeImage]}
                alt={`${vehicle.name} - imagen ${activeImage + 1}`}
                className="w-full object-cover transition-all duration-500"
                style={{ height: "clamp(320px, 40vw, 520px)" }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6M8 11h6" />
                  </svg>
                </div>
              </div>
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p === 0 ? galleryImages.length - 1 : p - 1)); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-80 hover:!opacity-100 hover:scale-110 backdrop-blur-sm bg-white/20"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImage((p) => (p === galleryImages.length - 1 ? 0 : p + 1)); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-80 hover:!opacity-100 hover:scale-110 backdrop-blur-sm bg-white/20"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                </>
              )}
              <span className="absolute top-4 left-4 text-[11px] uppercase tracking-widest font-bold px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                Imagen de Referencia
              </span>
              <span className="absolute bottom-4 right-4 text-[11px] uppercase tracking-widest font-bold px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                {activeImage + 1} / {galleryImages.length}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    i === activeImage ? "ring-2 ring-primary scale-[1.03] shadow-lg" : "opacity-50 hover:opacity-90 hover:scale-[1.02]"
                  }`}
                  style={{ height: 80 }}
                >
                  <img src={img} alt={`${vehicle.name} miniatura ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Aviso de imágenes de referencia */}
            <div className="neu-card">
              <div className="p-8 flex gap-5 items-start">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <span className="label-micro block mb-2">Sobre las imágenes</span>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Las imágenes mostradas son únicamente <strong className="text-foreground font-semibold">de referencia</strong> y no corresponden necesariamente a la unidad física en inventario. El estado real, color exacto, equipamiento y detalles cosméticos pueden variar respecto a las fotografías. Si deseas conocer la unidad en persona antes de tomar tu decisión, puedes agendar una cita para una inspección presencial en Corporativo CDMX escribiéndonos a{" "}
                    <a href="mailto:mmascote@jhl.mx" className="text-foreground font-semibold underline-offset-2 hover:underline">mmascote@jhl.mx</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="neu-card">
              <div className="p-10">
                <span className="label-micro block mb-4">Descripción</span>
                <p className="text-base leading-relaxed text-muted-foreground">{vehicle.description}</p>
              </div>
            </div>
          </div>

          {/* INFO SIDEBAR */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="neu-card">
              <div className="p-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-micro">{vehicle.type}</span>
                  <div className="flex gap-2">
                    {isEmployee && !vehicle.is_public && (
                      <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-destructive text-destructive-foreground">Exclusivo</span>
                    )}
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                        vehicle.status === "Disponible" ? "bg-primary text-primary-foreground" : "bg-muted text-background"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </div>
                </div>
                <h1 className="heading-xl mb-1">{vehicle.name}</h1>
                <p className="text-sm mb-8 text-muted-foreground">{vehicle.year}</p>

                {vehicle.price_employee ? (
                  <div className="mb-8 space-y-3">
                    <div>
                      <span className="label-micro block mb-1">Precio Público</span>
                      <p className="text-4xl font-light">${fmt(vehicle.price_public)}</p>
                    </div>
                    <div>
                      <span className="label-micro block mb-1 text-primary">Precio Preferencial*</span>
                      <p className="text-4xl font-light">${fmt(vehicle.price_employee)}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">* Sujeto a validación de elegibilidad</p>
                  </div>
                ) : (
                  <div className="mb-8">
                    <span className="label-micro block mb-1">Precio Total</span>
                    <p className="text-4xl font-light">${fmt(vehicle.price_public)}</p>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/solicitar-compra/${vehicle.slug}`)}
                  className="w-full py-5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.02] bg-primary text-primary-foreground"
                >
                  Solicitar Compra
                </button>
                <button
                  onClick={() => navigate(`/comparar?a=${vehicle.slug}`)}
                  className="w-full py-5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-200 hover:opacity-90 hover:scale-[1.02] mt-3 bg-secondary text-secondary-foreground"
                >
                  Comparar con otro vehículo
                </button>
              </div>
            </div>

            {/* Specs */}
            <div className="neu-card">
              <div className="p-10">
                <span className="label-micro block mb-6">Información del Vehículo</span>
                <div className="space-y-5">
                  {specs.map((s) => (
                    <div key={s.label} className="flex justify-between items-center border-b border-border/20 pb-4">
                      <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agendar visita */}
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="neu-accent block w-full text-left transition-all duration-200 hover:opacity-95 hover:scale-[1.01] cursor-pointer"
            >
              <div className="p-10 flex flex-col items-center justify-center text-center gap-4" style={{ minHeight: 200 }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-xs uppercase tracking-widest font-bold">Agenda una cita</span>
                <span className="heading-md">Quiero conocer este vehículo</span>
                <span className="text-xs opacity-90 mt-1">Te mostramos cómo enviarnos tu solicitud en segundos</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={galleryImages}
          initialIndex={activeImage}
          alt={vehicle.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <ScheduleVisitDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        vehicleName={vehicle.name}
        vehicleYear={vehicle.year}
      />

    </div>
  );
}
