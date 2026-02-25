interface Props {
  logoIcon: string;
  logoHorizontal: string;
}

export default function FooterSection({ logoIcon, logoHorizontal }: Props) {
  return (
    <footer className="border-t pt-16 mb-8" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src={logoIcon} alt="JH Leasing icon" className="h-8 w-auto" />
            <img src={logoHorizontal} alt="JH Leasing" className="h-7 w-auto" />
          </div>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Venta directa de vehículos de flotilla corporativa a precios preferenciales.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Inventario</h4>
          {["Vehículos", "Ofertas", "Eléctricos"].map((l) => (
            <a key={l} href="#" className="block text-sm mb-3 hover:opacity-70 transition-opacity">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Soporte</h4>
          {["Centro de Ayuda", "Contacto", "Política de Privacidad"].map((l) => (
            <a key={l} href="#" className="block text-sm mb-3 hover:opacity-70 transition-opacity">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Contacto</h4>
          <a href="tel:18005453273" className="block text-sm mb-3 hover:opacity-70 transition-opacity">1-800-JH-LEASE</a>
          <a href="mailto:support@jhleasing.com" className="block text-sm mb-3 hover:opacity-70 transition-opacity">support@jhleasing.com</a>
          <button
            className="mt-2 px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            Chat en Vivo
          </button>
        </div>
      </div>
      <div className="mt-12 text-xs text-center pb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
        © 2026 JH Leasing. All rights reserved.
      </div>
    </footer>
  );
}
