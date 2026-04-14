import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { BRANDS } from "@/data/brands";
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
  brand: string;
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
 * Builds a comma-separated inline list for Excel data validation.
 * Format: `"Item1,Item2,Item3"` (with enclosing double quotes).
 * If the resulting string exceeds 255 chars (Excel limit for inline
 * lists), returns null — the caller should fall back to a sheet reference.
 */
function inlineList(values: readonly string[]): string | null {
  const joined = values.join(",");
  // Excel inline validation limit is 255 chars INCLUDING the quotes.
  if (joined.length > 253) return null;
  return `"${joined}"`;
}

/**
 * Generates an .xlsx template using ExcelJS with working dropdown menus.
 *
 * Uses inline comma-separated lists for short option lists (Marca, Tipo,
 * Color, Sí/No) and a hidden helper sheet for longer lists (Estados de
 * Placas) that exceed Excel's 255-char inline limit.
 */
async function buildVehicleTemplateAsync(): Promise<Blob> {
  const wb = new ExcelJS.Workbook();

  const VALIDATED_ROWS = 100; // rows 2-101 get dropdowns
  const siNo = ["Sí", "No"] as const;

  // --- Hidden helper sheet for long lists (Estados de Placas) ---
  const wsHelper = wb.addWorksheet("_Datos", { state: "veryHidden" });
  for (let i = 0; i < PLATE_STATES.length; i++) {
    wsHelper.getCell(i + 1, 1).value = PLATE_STATES[i];
  }
  const statesFormula = `_Datos!$A$1:$A$${PLATE_STATES.length}`;

  // --- Vehículos sheet ---
  const ws = wb.addWorksheet("Vehículos");

  // Header row
  const headers = [...VEHICLE_TEMPLATE_HEADERS];
  ws.addRow(headers);
  const hRow = ws.getRow(1);
  hRow.font = { bold: true, size: 11 };
  hRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E4DF" } };
    cell.border = { bottom: { style: "thin", color: { argb: "FFCCCCCC" } } };
  });

  // Example rows
  const examples = [
    ["Chevrolet", "Aveo LT", "Sedán", 2024, 250000, 200000, "25,000 km",
     "LSGHD52H2ND158903", "Blanco", "CDMX", "CDMX",
     "Vehículo en excelente estado.", "No", "Sí", "Sí", ""],
    ["Hyundai", "Tucson Limited", "SUV", 2023, 580000, 480000, "15,000 km",
     "", "Negro", "Estado de México", "CDMX", "", "No", "Sí", "Sí", "2026-05-01"],
  ];
  for (const row of examples) ws.addRow(row);

  // Column widths
  ws.columns = headers.map((h) => ({ width: Math.max(15, h.length + 3) }));

  // --- Dropdown definitions ---
  // Build inline formulae for lists that fit; use sheet ref for long ones.
  const brandsList = inlineList(BRANDS);
  const typesList = inlineList(VEHICLE_TYPES);
  const colorsList = inlineList(VEHICLE_COLORS);
  const siNoList = inlineList(siNo);

  interface DropdownDef {
    header: TemplateHeader;
    formulae: string;
  }

  const dropdowns: DropdownDef[] = [
    { header: "Marca", formulae: brandsList ?? statesFormula /* fallback, shouldn't happen */ },
    { header: "Tipo", formulae: typesList! },
    { header: "Color", formulae: colorsList! },
    { header: "Estado de Placas", formulae: statesFormula },
    { header: "Blindado", formulae: siNoList! },
    { header: "Público", formulae: siNoList! },
    { header: "Activo", formulae: siNoList! },
  ];

  // Apply data validation to each dropdown column, rows 2 through VALIDATED_ROWS+1.
  for (const dd of dropdowns) {
    const colIdx = headers.indexOf(dd.header) + 1; // ExcelJS is 1-indexed
    for (let r = 2; r <= VALIDATED_ROWS + 1; r++) {
      ws.getCell(r, colIdx).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [dd.formulae],
        showErrorMessage: true,
        errorTitle: "Valor no válido",
        error: `Elige un valor de la lista para "${dd.header}".`,
      };
    }
  }

  // --- Instrucciones sheet ---
  const wsInst = wb.addWorksheet("Instrucciones");
  const lines: string[][] = [
    ["INSTRUCCIONES PARA LLENAR LA PLANTILLA"],
    [""],
    ["Campos obligatorios: Marca, Modelo, Tipo."],
    ["El resto son opcionales — se pueden completar después editando el vehículo."],
    [""],
    ["Las columnas Marca, Tipo, Color, Estado de Placas, Blindado, Público y Activo"],
    ["tienen menú desplegable. Haz clic en la celda y usa la flechita ▼."],
    [""],
    ["Para precios usa números enteros sin $ ni comas. Ej: 250000"],
    ["Para fechas usa formato YYYY-MM-DD. Ej: 2026-05-01. Deja vacío si no aplica."],
    [""],
    ["VALORES VÁLIDOS:"],
    [""],
    ["— Marcas:"],
    ...BRANDS.map((b) => [b]),
    [""],
    ["— Tipos:"],
    ...VEHICLE_TYPES.map((t) => [t]),
    [""],
    ["— Colores:"],
    ...VEHICLE_COLORS.map((c) => [c]),
    [""],
    ["— Estados de Placas:"],
    ...PLATE_STATES.map((s) => [s]),
  ];
  for (const l of lines) wsInst.addRow(l);
  wsInst.getColumn(1).width = 34;
  wsInst.getRow(1).font = { bold: true, size: 13 };

  // --- Write ---
  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** Triggers a browser download of the generated template. */
export async function downloadVehicleTemplate(filename = "plantilla-vehiculos.xlsx") {
  const blob = await buildVehicleTemplateAsync();
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

  // Find the "Vehículos" sheet explicitly. The template also ships with a
  // hidden "_Datos" sheet (for dropdown references) and an "Instrucciones"
  // sheet — we must NOT try to parse those. If the user renamed the sheet
  // or uploaded a non-template file, fall back to the first sheet that
  // actually contains our expected header "Marca" in row 1.
  const pickSheetName = (): string | undefined => {
    // Prefer exact match (case-insensitive, handles accents).
    const exact = wb.SheetNames.find(
      (n) => n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === "vehiculos",
    );
    if (exact) return exact;
    // Fallback: any sheet whose first row contains the "Marca" header.
    for (const n of wb.SheetNames) {
      const firstRow = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets[n],
        { header: 1, range: 0, defval: "" },
      )[0] as unknown[] | undefined;
      if (firstRow && firstRow.map((c) => String(c).trim()).includes("Marca")) {
        return n;
      }
    }
    return wb.SheetNames[0];
  };

  const sheetName = pickSheetName();
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
    }
    // Custom brands are allowed — they just won't have a predefined logo
    // unless the admin uploads one via the brand logo uploader.

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
      brand,
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
