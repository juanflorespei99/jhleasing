/**
 * Shared option lists for vehicle attributes. Used by both the manual
 * VehicleForm and the bulk Excel upload flow.
 */

export const VEHICLE_TYPES = [
  "SUV",
  "Sedán",
  "Hatchback",
  "Pick-up",
  "Van",
  "Coupé",
] as const;

export const VEHICLE_COLORS = [
  "Negro",
  "Blanco",
  "Blanco perla",
  "Plata",
  "Gris",
  "Gris plata",
  "Azul",
  "Rojo",
  "Dorado",
  "Verde",
  "Beige",
  "Café",
  "Naranja",
  "Amarillo",
] as const;

export const PLATE_STATES = [
  "CDMX",
  "JALISCO",
  "SONORA",
  "MORELOS",
  "Estado de México",
  "Nuevo León",
  "Puebla",
  "Querétaro",
  "Guanajuato",
  "Veracruz",
  "Chihuahua",
  "Yucatán",
  "Quintana Roo",
  "Baja California",
  "Sinaloa",
  "Coahuila",
  "Tamaulipas",
  "Michoacán",
  "Oaxaca",
  "Guerrero",
  "Tabasco",
  "San Luis Potosí",
  "Hidalgo",
  "Aguascalientes",
  "Nayarit",
  "Durango",
  "Zacatecas",
  "Colima",
  "Campeche",
  "Tlaxcala",
  "Baja California Sur",
  "Chiapas",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type VehicleColor = (typeof VEHICLE_COLORS)[number];
export type PlateState = (typeof PLATE_STATES)[number];
