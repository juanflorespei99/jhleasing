interface Props {
  logoIcon: string;
  logoHorizontal: string;
}

export default function FooterSection({ logoIcon, logoHorizontal }: Props) {
  return (
    <footer className="rounded-2xl bg-secondary text-secondary-foreground pt-10 md:pt-16 pb-6 md:pb-8 px-5 md:px-10 mb-4 md:mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3">
            <img src={logoHorizontal} alt="JH Leasing" className="h-7 w-auto" />
          </div>
          <p className="text-sm text-secondary-foreground/60">Venta directa de vehículos de flotilla corporativa a precios preferenciales.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 md:mb-6 text-secondary-foreground/50">Inventario</h4>
          {["Vehículos", "Ofertas"].map((l) => (
            <a key={l} href="#" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">{l}</a>
          ))}
        </div>
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-xs uppercase tracking-widest mb-4 md:mb-6 text-secondary-foreground/50">Contacto</h4>
          <a href="tel:+525550048424" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">+52 55 5004 8424</a>
          <a href="mailto:info@jhl.mx" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">info@jhl.mx</a>
        </div>
      </div>
      <div className="mt-8 md:mt-12 text-xs text-center text-secondary-foreground/40">
        © 2026 JH Leasing. All rights reserved.
      </div>
    </footer>
  );
}
