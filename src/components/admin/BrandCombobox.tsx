import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BRANDS, isKnownBrand } from "@/data/brands";

interface Props {
  value: string;
  onChange: (brand: string) => void;
  /** Extra brand names fetched from the brand_logos table. */
  customBrands?: string[];
}

export default function BrandCombobox({ value, onChange, customBrands = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Merge predefined + custom brands, deduplicate, sort.
  const allBrands = Array.from(
    new Set([...BRANDS, ...customBrands]),
  ).sort((a, b) => a.localeCompare(b, "es"));

  // Detect if the user is typing something not in the combined list.
  const trimmedSearch = search.trim();
  const showCreateOption =
    trimmedSearch.length > 0 &&
    !allBrands.some((b) => b.toLowerCase() === trimmedSearch.toLowerCase());

  const handleSelect = (brand: string) => {
    onChange(brand);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between mt-1 font-normal"
        >
          {value || "Seleccionar marca..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o escribir marca..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {trimmedSearch
                ? "No se encontró. Escribe el nombre completo para crear una marca nueva."
                : "Escribe para buscar..."}
            </CommandEmpty>
            <CommandGroup>
              {allBrands
                .filter((b) =>
                  b.toLowerCase().includes(trimmedSearch.toLowerCase()),
                )
                .map((brand) => (
                  <CommandItem
                    key={brand}
                    value={brand}
                    onSelect={() => handleSelect(brand)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === brand ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {brand}
                    {!isKnownBrand(brand) && (
                      <span className="ml-auto text-[10px] text-muted-foreground">personalizada</span>
                    )}
                  </CommandItem>
                ))}
              {showCreateOption && (
                <CommandItem
                  value={`__create__${trimmedSearch}`}
                  onSelect={() => handleSelect(trimmedSearch)}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Usar marca: <strong className="ml-1">{trimmedSearch}</strong>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
