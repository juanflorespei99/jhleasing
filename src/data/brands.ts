import audiLogo from "@/assets/brands/audi.svg";
import bmwLogo from "@/assets/brands/bmw.svg";
import chevroletLogo from "@/assets/brands/chevrolet.svg";
import chireyLogo from "@/assets/brands/chirey.svg";
import chryslerLogo from "@/assets/brands/chrysler.svg";
import dodgeLogo from "@/assets/brands/dodge.svg";
import fordLogo from "@/assets/brands/ford.svg";
import gmcLogo from "@/assets/brands/gmc.svg";
import hondaLogo from "@/assets/brands/honda.svg";
import hyundaiLogo from "@/assets/brands/hyundai.svg";
import jacLogo from "@/assets/brands/jac.svg";
import jeepLogo from "@/assets/brands/jeep.svg";
import kiaLogo from "@/assets/brands/kia.svg";
import landRoverLogo from "@/assets/brands/land-rover.svg";
import mazdaLogo from "@/assets/brands/mazda.svg";
import mercedesLogo from "@/assets/brands/mercedes.svg";
import mgLogo from "@/assets/brands/mg.svg";
import miniLogo from "@/assets/brands/mini.svg";
import nissanLogo from "@/assets/brands/nissan.svg";
import peugeotLogo from "@/assets/brands/peugeot.svg";
import renaultLogo from "@/assets/brands/renault.svg";
import seatLogo from "@/assets/brands/seat.svg";
import suzukiLogo from "@/assets/brands/suzuki.svg";
import toyotaLogo from "@/assets/brands/toyota.svg";
import volkswagenLogo from "@/assets/brands/volkswagen.svg";
import volvoLogo from "@/assets/brands/volvo.svg";

/** All supported brands, sorted alphabetically */
export const BRANDS = [
  "Audi", "BMW", "Chevrolet", "Chirey", "Chrysler", "Dodge",
  "Ford", "GMC", "Honda", "Hyundai", "JAC", "Jeep", "KIA",
  "Land Rover", "Mazda", "Mercedes", "MG", "Mini", "Nissan",
  "Peugeot", "Renault", "SEAT", "Suzuki", "Toyota", "Volkswagen", "Volvo",
] as const;

export type Brand = (typeof BRANDS)[number];

/** Brand name → SVG logo mapping */
export const brandLogos: Record<string, string> = {
  Audi: audiLogo,
  BMW: bmwLogo,
  Chevrolet: chevroletLogo,
  Chirey: chireyLogo,
  Chrysler: chryslerLogo,
  Dodge: dodgeLogo,
  Ford: fordLogo,
  GMC: gmcLogo,
  Honda: hondaLogo,
  Hyundai: hyundaiLogo,
  JAC: jacLogo,
  Jeep: jeepLogo,
  KIA: kiaLogo,
  "Land Rover": landRoverLogo,
  Mazda: mazdaLogo,
  Mercedes: mercedesLogo,
  MG: mgLogo,
  Mini: miniLogo,
  Nissan: nissanLogo,
  Peugeot: peugeotLogo,
  Renault: renaultLogo,
  SEAT: seatLogo,
  Suzuki: suzukiLogo,
  Toyota: toyotaLogo,
  Volkswagen: volkswagenLogo,
  Volvo: volvoLogo,
};

/** Type guard: check if a string is one of the 26 predefined brands. */
export function isKnownBrand(brand: string): brand is Brand {
  return (BRANDS as readonly string[]).includes(brand);
}
