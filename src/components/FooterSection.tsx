interface Props {
  logoIcon: string;
  logoHorizontal: string;
}

export default function FooterSection({ logoIcon, logoHorizontal }: Props) {
  return (
    <footer className="rounded-2xl bg-secondary text-secondary-foreground pt-10 md:pt-16 pb-6 md:pb-8 px-5 md:px-10 mb-4 md:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        <div>
          <div className="mb-3">
            <img src={logoHorizontal} alt="JH Leasing" className="h-7 w-auto" />
          </div>
          <p className="text-sm text-secondary-foreground/60">Venta directa de vehículos de flotilla corporativa a precios preferenciales.</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-4 md:mb-6 text-secondary-foreground/50">Inventario</h4>
          <a href="#" className="block text-sm mb-3 text-secondary-foreground/80 hover:text-primary transition-colors">Vehículos</a>
        </div>
      </div>
      <div className="mt-8 md:mt-12 flex flex-col items-center gap-2 text-xs text-secondary-foreground/40">
        <div className="flex items-center gap-3">
          <a
            href="https://www.jhl.mx/aviso-de-privacidad#tab-1"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            Aviso de Privacidad
          </a>
          <span className="text-secondary-foreground/20">|</span>
          <a
            href="https://www.jhl.mx/aviso-de-privacidad#tab-2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            Política de Privacidad
          </a>
        </div>
        <span>© 2026 JHLeasing. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
