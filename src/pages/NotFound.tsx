import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="neu-card p-16 text-center">
        <p className="text-6xl font-extralight mb-4 text-foreground">404</p>
        <p className="heading-md mb-6 text-muted-foreground">Página no encontrada</p>
        <Link
          to="/"
          className="inline-block px-8 py-4 rounded-full text-xs uppercase tracking-widest font-bold transition-all hover:opacity-90 bg-primary text-primary-foreground"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
