interface Props {
  logoIcon: string;
  logoHorizontal: string;
}

export default function FooterSection({ logoIcon, logoHorizontal }: Props) {
  return (
    <footer className="rounded-2xl bg-secondary text-secondary-foreground pt-16 pb-8 px-10 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src={logoIcon} alt="JH Leasing icon" className="h-8 w-auto" />
            <img src={logoHorizontal} alt="JH Leasing" className="h-7 w-auto" />
          </div>
          <p className="text-sm text-secondary-foreground/60">Venta directa de vehículos de flotilla corporativa a precios preferenciales.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6 text-secondary-foreground/50">Inventario</h4>
          {["Vehículos", "Ofertas", "Eléctricos"].map((l) => (
            <a key={l} href="#" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6 text-secondary-foreground/50">Soporte</h4>
          {["Centro de Ayuda", "Contacto", "Política de Privacidad"].map((l) => (
            <a key={l} href="#" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6 text-secondary-foreground/50">Contacto</h4>
          <a href="tel:18005453273" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">1-800-JH-LEASE</a>
          <a href="mailto:support@jhleasing.com" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">support@jhleasing.com</a>
        </div>
      </div>
      <div className="mt-12 text-xs text-center text-secondary-foreground/40">
        © 2026 JH Leasing. All rights reserved.
      </div>
    </footer>
  );
}
