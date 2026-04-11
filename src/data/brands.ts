/**
 * Brand catalog with official logos via Clearbit Logo API.
 *
 * Clearbit serves real company logos as PNGs at:
 *   https://logo.clearbit.com/{domain}?size={px}
 *
 * These replace the previous AI-generated SVGs that were not the
 * official brand logos. If Clearbit ever becomes unavailable, replace
 * the URLs with locally-hosted PNGs in src/assets/brands/.
 */

/** Helper to build a Clearbit logo URL at a consistent size. */
const cb = (domain: string, size = 128): string =>
  `https://logo.clearbit.com/${domain}?size=${size}`;

/** All supported brands, sorted alphabetically */
export const BRANDS = [
  "Audi", "BMW", "Chevrolet", "Chirey", "Chrysler", "Dodge",
  "Ford", "GMC", "Honda", "Hyundai", "JAC", "KIA",
  "Land Rover", "Mazda", "Mercedes", "MG", "Nissan",
  "Renault", "Suzuki", "Toyota", "Volkswagen", "Volvo",
] as const;

export type Brand = (typeof BRANDS)[number];

/** Brand name → logo URL mapping */
export const brandLogos: Record<string, string> = {
  Audi: cb("audi.com"),
  BMW: cb("bmw.com"),
  Chevrolet: cb("chevrolet.com"),
  Chirey: cb("chirey.mx"),
  Chrysler: cb("chrysler.com"),
  Dodge: cb("dodge.com"),
  Ford: cb("ford.com"),
  GMC: cb("gmc.com"),
  Honda: cb("honda.com"),
  Hyundai: cb("hyundai.com"),
  JAC: cb("jacmexico.com.mx"),
  KIA: cb("kia.com"),
  "Land Rover": cb("landrover.com"),
  Mazda: cb("mazda.com"),
  Mercedes: cb("mercedes-benz.com"),
  MG: cb("mgmotor.com"),
  Nissan: cb("nissan.com"),
  Renault: cb("renault.com"),
  Suzuki: cb("suzuki.com"),
  Toyota: cb("toyota.com"),
  Volkswagen: cb("volkswagen.com"),
  Volvo: cb("volvo.com"),
};
