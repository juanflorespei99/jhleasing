import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Globe, RotateCcw, Search } from "lucide-react";

interface DomainRow {
  id: string;
  domain: string;
  created_at: string;
}

export default function DomainManagement() {
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("allowed_domains")
      .select("*")
      .order("domain", { ascending: true });
    if (error) {
      toast.error("Error cargando dominios");
    } else {
      setDomains((data ?? []) as DomainRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAdd = async () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) {
      toast.error("Escribe un dominio");
      return;
    }
    // Basic domain format validation
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(trimmed)) {
      toast.error("Formato de dominio inválido. Ejemplo: empresa.com");
      return;
    }
    if (domains.some((d) => d.domain === trimmed)) {
      toast.error("Ese dominio ya está registrado");
      return;
    }

    setAdding(true);
    const { error } = await supabase
      .from("allowed_domains")
      .insert({ domain: trimmed });
    if (error) {
      const msg = error.message.includes("duplicate")
        ? "Ese dominio ya existe"
        : error.message;
      toast.error(msg);
    } else {
      toast.success(`Dominio "${trimmed}" agregado`);
      setNewDomain("");
      fetchDomains();
    }
    setAdding(false);
  };

  const handleDelete = async (domain: DomainRow) => {
    const { error } = await supabase
      .from("allowed_domains")
      .delete()
      .eq("id", domain.id);
    if (error) {
      toast.error("Error eliminando dominio");
    } else {
      toast.success(`Dominio "${domain.domain}" eliminado`);
      fetchDomains();
    }
  };

  const filtered = domains.filter((d) =>
    d.domain.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl bg-blue-500/5 border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          <strong>¿Cómo funciona?</strong> Solo los usuarios con correos de los dominios
          listados aquí pueden crear cuenta. Al registrarse, se les asigna automáticamente
          el rol de <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[10px] mx-1">Empleado</Badge>.
          Los dominios no autorizados son rechazados al momento del registro.
        </p>
      </div>

      {/* Toolbar: search + add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dominio..."
            className="pl-9 rounded-full"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={fetchDomains}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Add domain form */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="nuevo-dominio.com"
            className="pl-9 rounded-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={adding || !newDomain.trim()}
          className="rounded-full flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          {adding ? "Agregando..." : "Agregar dominio"}
        </Button>
      </div>

      {/* Domain list */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando dominios...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "No se encontraron dominios" : "No hay dominios registrados"}
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Dominio
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Fecha de alta
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono text-foreground">{d.domain}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(d.created_at).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          title="Eliminar dominio"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar dominio?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará <strong>{d.domain}</strong> de los dominios
                            autorizados. Los usuarios que ya tienen cuenta no se verán
                            afectados, pero ya no se podrán registrar nuevos usuarios
                            con correos de este dominio.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(d)}
                          >
                            Eliminar
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <p className="text-xs text-muted-foreground text-center">
          {domains.length} dominio{domains.length !== 1 ? "s" : ""} autorizado{domains.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
