import * as XLSX from "xlsx";
import { BRANDS, type Brand } from "@/data/brands";
import {
  VEHICLE_TYPES,
  VEHICLE_COLORS,
  PLATE_STATES,
} from "@/data/vehicleOptions";

/**
 * Bulk vehicle upload via Excel template.
 *
 * Two operations live here:
 *  - {@link downloadVehicleTemplate} generates an .xlsx file with the
 *    expected columns, two example rows, and a second sheet listing all
 *    valid values for enum fields.
 *  - {@link parseVehicleExcel} reads an uploaded .xlsx file, validates each
 *    row against the same rules used by the manual VehicleForm, and returns
 *    a list of insertable rows plus a list of per-row errors.
 *
 * Validation philosophy: be strict about required fields and enum values
 * (brand, type, color, plate state) so the resulting vehicles are
 * consistent with what the rest of the app expects, but be permissive
 * about everything else — empty optional fields fall back to sensible
 * defaults so the admin can fill them in later by editing the vehicle.
 */

/** Headers shown in the template's "Vehículos" sheet, in order. */
export const VEHICLE_TEMPLATE_HEADERS = [
  "Marca",
  "Modelo",
  "Tipo",
  "Año",
  "Precio Público",
  "Precio Empleado",
  "Kilometraje",
  "VIN / Serial",
  "Color",
  "Estado de Placas",
  "Ubicación",
  "Descripción",
  "Blindado",
  "Público",
  "Activo",
  "Fecha Liberación",
] as const;

type TemplateHeader = (typeof VEHICLE_TEMPLATE_HEADERS)[number];

/** Shape of a row that has been parsed and is ready to insert. */
export interface ParsedVehicleRow {
  /** 1-indexed row number from the original spreadsheet, used for error reporting. */
  excelRow: number;
  brand: Brand;
  name: string;
  type: string;
  year: number;
  price_public: number;
  price_employee: number;
  mileage: string;
  vin: string;
  color: string;
  plate_state: string;
  location: string;
  description: string;
  is_armored: boolean;
  is_public: boolean;
  is_active: boolean;
  release_at_public: string | null;
}

/** A single validation error, scoped to one cell. */
export interface ParseError {
  excelRow: number;
  field: TemplateHeader | "general";
  message: string;
}

export interface ParseResult {
  rows: ParsedVehicleRow[];
  errors: ParseError[];
  totalRowsRead: number;
}

// ---------- DOWNLOAD ----------

/**
 * Generates an .xlsx Blob with two sheets:
 *  1. "Vehículos" — headers + 2 example rows the admin can overwrite.
 *  2. "Instrucciones" — list of valid enum values + format notes.
 */
export function buildVehicleTemplate(): Blob {
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Vehículos ---
  const exampleRows: Record<TemplateHeader, string | number>[] = [
    {
      Marca: "Chevrolet",
      Modelo: "Aveo LT",
      Tipo: "Sedán",
      "Año": 2024,
      "Precio Público": 250000,
      "Precio Empleado": 200000,
      Kilometraje: "25,000 km",
      "VIN / Serial": "LSGHD52H2ND158903",
      Color: "Blanco",
      "Estado de Placas": "CDMX",
      "Ubicación": "CDMX",
      "Descripción": "Vehículo en excelente estado, único dueño.",
      Blindado: "No",
      "Público": "Sí",
      Activo: "Sí",
      "Fecha Liberación": "",
    },
    {
      Marca: "Hyundai",
      Modelo: "Tucson Limited",
      Tipo: "SUV",
      "Año": 2023,
      "Precio Público": 580000,
      "Precio Empleado": 480000,
      Kilometraje: "15,000 km",
      "VIN / Serial": "",
      Color: "Negro",
      "Estado de Placas": "Estado de México",
      "Ubicación": "CDMX",
      "Descripción": "",
      Blindado: "No",
      "Público": "Sí",
      Activo: "Sí",
      "Fecha Liberación": "2026-05-01",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(exampleRows, {
    header: [...VEHICLE_TEMPLATE_HEADERS],
  });

  // Set reasonable column widths so headers are readable.
  ws["!cols"] = VEHICLE_TEMPLATE_HEADERS.map((h) => ({
    wch: Math.max(14, h.length + 2),
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Vehículos");

  // --- Sheet 2: Instrucciones ---
  const instructions: (string | number)[][] = [
    ["INSTRUCCIONES PARA LLENAR LA PLANTILLA"],
    [],
    ["Campos obligatorios: Marca, Modelo, Tipo."],
    ["El resto son opcionales y se pueden completar después editando el vehículo."],
    [],
    ["Para campos Sí/No usa exactamente: Sí, No, true, false, 1 o 0."],
    ["Para precios usa solo números enteros (sin $ ni comas). Ej: 250000"],
    ["Para fechas usa formato YYYY-MM-DD. Ej: 2026-05-01. Deja vacío si no aplica."],
    [],
    ["VALORES VÁLIDOS (las celdas deben coincidir exactamente):"],
    [],
    ["Marcas válidas:"],
    ...BRANDS.map((b) => [b]),
    [],
    ["Tipos válidos:"],
    ...VEHICLE_TYPES.map((t) => [t]),
    [],
    ["Colores válidos:"],
    ...VEHICLE_COLORS.map((c) => [c]),
    [],
    ["Estados de Placas válidos:"],
    ...PLATE_STATES.map((s) => [s]),
  ];

  const wsInst = XLSX.utils.aoa_to_sheet(instructions);
  wsInst["!cols"] = [{ wch: 32 }];
  XLSX.utils.book_append_sheet(wb, wsInst, "Instrucciones");

  // --- Write to Blob ---
  const arrayBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** Triggers a browser download of the generated template. */
export function downloadVehicleTemplate(filename = "plantilla-vehiculos.xlsx") {
  const blob = buildVehicleTemplate();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- PARSE ----------

const TRUTHY_VALUES = new Set(["sí", "si", "true", "1", "yes", "y", "verdadero"]);
const FALSY_VALUES = new Set(["no", "false", "0", "n", "falso", ""]);

/** Parse a Sí/No-ish cell into a boolean, with a fallback. */
function parseBoolean(raw: unknown, fallback: boolean): boolean {
  if (raw === undefined || raw === null || raw === "") return fallback;
  const normalized = String(raw).trim().toLowerCase();
  if (TRUTHY_VALUES.has(normalized)) return true;
  if (FALSY_VALUES.has(normalized)) return false;
  return fallback;
}

/** Best-effort parse of a date cell into ISO string, or null if empty/invalid. */
function parseDate(raw: unknown): { value: string | null; valid: boolean } {
  if (raw === undefined || raw === null || raw === "") {
    return { value: null, valid: true };
  }
  // SheetJS may return Date objects when cellDates: true.
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return { value: null, valid: false };
    return { value: raw.toISOString(), valid: true };
  }
  const text = String(raw).trim();
  // Accept YYYY-MM-DD or anything Date can parse.
  const d = new Date(text);
  if (isNaN(d.getTime())) return { value: null, valid: false };
  return { value: d.toISOString(), valid: true };
}

function parseNumber(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number") return raw;
  const cleaned = String(raw).replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return isNaN(n) ? null : n;
}

function trimString(raw: unknown): string {
  if (raw === undefined || raw === null) return "";
  return String(raw).trim();
}

/**
 * Parse an uploaded .xlsx (or .xls / .csv) file. Reads only the first sheet,
 * skipping completely empty rows.
 */
export async function parseVehicleExcel(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return {
      rows: [],
      errors: [
        { excelRow: 0, field: "general", message: "El archivo no contiene hojas." },
      ],
      totalRowsRead: 0,
    };
  }

  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const validBrands = new Set<string>(BRANDS);
  const validTypes = new Set<string>(VEHICLE_TYPES);
  const validColors = new Set<string>(VEHICLE_COLORS);
  const validPlateStates = new Set<string>(PLATE_STATES);

  const rows: ParsedVehicleRow[] = [];
  const errors: ParseError[] = [];
  const currentYear = new Date().getFullYear();

  rawRows.forEach((row, idx) => {
    // Excel row number = idx + 2 (1-indexed plus header row).
    const excelRow = idx + 2;

    // Skip rows that look entirely empty.
    const allEmpty = VEHICLE_TEMPLATE_HEADERS.every(
      (h) => trimString(row[h]) === "",
    );
    if (allEmpty) return;

    const brand = trimString(row["Marca"]);
    const name = trimString(row["Modelo"]);
    const type = trimString(row["Tipo"]);

    let hasFatalError = false;

    if (!brand) {
      errors.push({ excelRow, field: "Marca", message: "La marca es obligatoria." });
      hasFatalError = true;
    } else if (!validBrands.has(brand)) {
      errors.push({
        excelRow,
        field: "Marca",
        message: `Marca no permitida: "${brand}". Revisa la hoja "Instrucciones" del template para ver las marcas válidas.`,
      });
      hasFatalError = true;
    }

    if (!name) {
      errors.push({ excelRow, field: "Modelo", message: "El modelo es obligatorio." });
      hasFatalError = true;
    }

    if (!type) {
      errors.push({ excelRow, field: "Tipo", message: "El tipo es obligatorio." });
      hasFatalError = true;
    } else if (!validTypes.has(type)) {
      errors.push({
        excelRow,
        field: "Tipo",
        message: `Tipo no permitido: "${type}". Tipos válidos: ${VEHICLE_TYPES.join(", ")}.`,
      });
      hasFatalError = true;
    }

    // Optional enum fields: error only if non-empty AND invalid.
    const color = trimString(row["Color"]);
    if (color && !validColors.has(color)) {
      errors.push({
        excelRow,
        field: "Color",
        message: `Color no permitido: "${color}". Déjalo vacío si no estás seguro.`,
      });
      hasFatalError = true;
    }

    const plateState = trimString(row["Estado de Placas"]);
    if (plateState && !validPlateStates.has(plateState)) {
      errors.push({
        excelRow,
        field: "Estado de Placas",
        message: `Estado de Placas no permitido: "${plateState}".`,
      });
      hasFatalError = true;
    }

    // Numeric fields: tolerate empty (default to 0 or current year).
    const yearParsed = parseNumber(row["Año"]);
    let year = currentYear;
    if (yearParsed !== null) {
      if (yearParsed < 1980 || yearParsed > currentYear + 2) {
        errors.push({
          excelRow,
          field: "Año",
          message: `Año fuera de rango: ${yearParsed}. Debe estar entre 1980 y ${currentYear + 2}.`,
        });
        hasFatalError = true;
      } else {
        year = yearParsed;
      }
    }

    const pricePublic = parseNumber(row["Precio Público"]) ?? 0;
    if (pricePublic < 0) {
      errors.push({
        excelRow,
        field: "Precio Público",
        message: "El precio público no puede ser negativo.",
      });
      hasFatalError = true;
    }

    const priceEmployee = parseNumber(row["Precio Empleado"]) ?? 0;
    if (priceEmployee < 0) {
      errors.push({
        excelRow,
        field: "Precio Empleado",
        message: "El precio empleado no puede ser negativo.",
      });
      hasFatalError = true;
    }

    // Date is optional but invalid format is reported.
    const dateRaw = row["Fecha Liberación"];
    const { value: releaseAt, valid: dateValid } = parseDate(dateRaw);
    if (!dateValid) {
      errors.push({
        excelRow,
        field: "Fecha Liberación",
        message: `Fecha inválida: "${String(dateRaw)}". Usa formato YYYY-MM-DD o déjala vacía.`,
      });
      hasFatalError = true;
    }

    if (hasFatalError) return;

    rows.push({
      excelRow,
      brand: brand as Brand,
      name,
      type,
      year,
      price_public: pricePublic,
      price_employee: priceEmployee,
      mileage: trimString(row["Kilometraje"]),
      vin: trimString(row["VIN / Serial"]),
      color,
      plate_state: plateState,
      location: trimString(row["Ubicación"]),
      description: trimString(row["Descripción"]),
      is_armored: parseBoolean(row["Blindado"], false),
      is_public: parseBoolean(row["Público"], true),
      is_active: parseBoolean(row["Activo"], true),
      release_at_public: releaseAt,
    });
  });

  return { rows, errors, totalRowsRead: rawRows.length };
}

// ---------- HELPERS FOR INSERT ----------

/**
 * Slugify a brand+name+year tuple, matching the same algorithm used in
 * VehicleForm so manually-created and bulk-uploaded vehicles produce
 * identical slug shapes.
 */
export function slugifyVehicle(brand: string, name: string, year: number): string {
  return `${brand}-${name}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Convert a parsed row into the exact payload shape that the `vehicles`
 * table expects on insert. Mirrors the payload built in VehicleForm.
 */
export function parsedRowToInsertPayload(
  row: ParsedVehicleRow,
  createdBy: string | null,
) {
  return {
    brand: row.brand,
    name: row.name,
    type: row.type,
    year: row.year,
    slug: slugifyVehicle(row.brand, row.name, row.year),
    price_public: row.price_public,
    price_employee: row.price_employee,
    mileage: row.mileage,
    vin: row.vin,
    location: row.location,
    description: row.description,
    is_public: row.is_public,
    is_active: row.is_active,
    is_armored: row.is_armored,
    color: row.color,
    plate_state: row.plate_state,
    release_at_public: row.release_at_public,
    img: "",
    images: [] as string[],
    created_by: createdBy,
  };
}
