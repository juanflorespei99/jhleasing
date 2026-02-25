const testimonials = [
  {
    role: "Director Comercial",
    quote: '"Proceso impecable."',
    body: '"Compré mi vehículo de flotilla directamente desde el portal. El proceso fue rápido y transparente."',
    name: "Mark S.",
    initials: "MS",
  },
  {
    role: "Gerente de RRHH",
    quote: '"Ideal para el equipo."',
    body: '"Implementar JH Leasing para nuestros empleados fue la mejor decisión. Precios preferenciales y sin complicaciones."',
    name: "Sarah J.",
    initials: "SJ",
  },
  {
    role: "Desarrollador",
    quote: '"Me encanta mi nuevo EV."',
    body: '"La selección de vehículos eléctricos es impresionante. La entrega fue más rápida de lo esperado."',
    name: "David L.",
    initials: "DL",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mb-20">
      <div className="flex gap-6 overflow-x-auto pb-10 pt-4 -mt-4 px-4 -mx-4" style={{ scrollbarWidth: "none" }}>
        {testimonials.map((t) => (
          <div key={t.name} className="neu-card flex-shrink-0" style={{ minWidth: 340 }}>
            <div className="p-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-lg font-bold"
                style={{
                  boxShadow: "-12px -12px 24px #FFFFFF, 12px 12px 24px #CFCFCF",
                  background: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                {t.initials}
              </div>
              <span className="label-micro mb-2 block">{t.role}</span>
              <p className="heading-md mb-4">{t.quote}</p>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>{t.body}</p>
              <p className="text-xs font-bold uppercase tracking-widest">{t.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
