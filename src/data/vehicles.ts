export interface Vehicle {
  id: string;
  type: string;
  brand: string;
  name: string;
  year: number;
  price: number;
  employeePrice: number;
  mileage: string;
  img: string;
  images: string[];
  status: "Disponible" | "Vendido";
  vin: string;
  location: string;
  description: string;
}

export const vehicles: Vehicle[] = [
  {
    id: "chevrolet-aveo-2024",
    type: "Sedán",
    brand: "Chevrolet",
    name: "Chevrolet Aveo 1.5LS B AT",
    year: 2024,
    price: 157275,
    employeePrice: 125820,
    mileage: "54,000 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/640px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png/640px-2024_Chevrolet_Aveo_Sed%C3%A1n_LT_%28Mexico%29_front_view.png",
    ],
    status: "Disponible",
    vin: "3G1TC5CF0RL000001",
    location: "Jalisco",
    description: "Sedán compacto económico de flotilla corporativa. Transmisión automática, motor 1.5L eficiente, ideal para uso urbano. Mantenimiento al corriente.",
  },
  {
    id: "hyundai-grand-i10-2026",
    type: "Sedán",
    brand: "Hyundai",
    name: "Hyundai Grand i10 Sedan GL MID",
    year: 2026,
    price: 200300,
    employeePrice: 160240,
    mileage: "22,000 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2022_Hyundai_Grand_i10_1.2_Value_Sedan_%28cropped%29.jpg/640px-2022_Hyundai_Grand_i10_1.2_Value_Sedan_%28cropped%29.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/2022_Hyundai_Grand_i10_1.2_Value_Sedan_%28cropped%29.jpg/640px-2022_Hyundai_Grand_i10_1.2_Value_Sedan_%28cropped%29.jpg",
    ],
    status: "Disponible",
    vin: "MALA851CAFM000002",
    location: "Sonora",
    description: "Sedán subcompacto prácticamente nuevo, bajo kilometraje. Equipamiento GL MID con aire acondicionado, dirección hidráulica y sistema de audio. Excelente rendimiento de combustible.",
  },
  {
    id: "nissan-versa-2024",
    type: "Sedán",
    brand: "Nissan",
    name: "Nissan Versa Advance CVT",
    year: 2024,
    price: 218650,
    employeePrice: 174920,
    mileage: "40,000 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/2020_Nissan_Versa_SV_1.6L%2C_front_2.29.20.jpg/640px-2020_Nissan_Versa_SV_1.6L%2C_front_2.29.20.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/2020_Nissan_Versa_SV_1.6L%2C_front_2.29.20.jpg/640px-2020_Nissan_Versa_SV_1.6L%2C_front_2.29.20.jpg",
    ],
    status: "Disponible",
    vin: "3N1CN8DV0RL000003",
    location: "CDMX",
    description: "Sedán con transmisión CVT, versión Advance con pantalla táctil, cámara de reversa y sensores de estacionamiento. Historial de servicio completo en agencia.",
  },
  {
    id: "gmc-yukon-xl-2025",
    type: "Blindada",
    brand: "GMC",
    name: "GMC Yukon XL Blindada",
    year: 2025,
    price: 1195700,
    employeePrice: 956560,
    mileage: "38,618 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2025_GMC_Yukon_AT4_Facelift.jpg/640px-2025_GMC_Yukon_AT4_Facelift.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/2025_GMC_Yukon_AT4_Facelift.jpg/640px-2025_GMC_Yukon_AT4_Facelift.jpg",
    ],
    status: "Disponible",
    vin: "1GKS2HKJ5RR000004",
    location: "CDMX",
    description: "SUV de lujo con blindaje de fábrica. Motor V8, tracción 4x4, tercera fila de asientos, sistema de infoentretenimiento premium. Vehículo de protección ejecutiva en excelente estado.",
  },
  {
    id: "gmc-suburban-2015",
    type: "Blindada",
    brand: "GMC",
    name: "GMC Suburban 4X2 Blindaje",
    year: 2015,
    price: 320325,
    employeePrice: 256260,
    mileage: "90,000 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg/640px-2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg/640px-2015_Chevrolet_Suburban_LT_in_black%2C_front_left_side_view.jpg",
    ],
    status: "Disponible",
    vin: "1GNSKJKC0FR000005",
    location: "Morelos",
    description: "SUV blindada tracción 4x2, ideal para traslado ejecutivo. Motor V8 5.3L, amplio espacio interior, blindaje certificado. Mantenimiento preventivo al día.",
  },
  {
    id: "chevrolet-tahoe-2023",
    type: "SUV",
    brand: "Chevrolet",
    name: "Chevrolet Tahoe High Country",
    year: 2023,
    price: 815775,
    employeePrice: 652620,
    mileage: "87,312 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg/640px-2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg/640px-2021_Chevrolet_Tahoe_High_Country%2C_front_12.24.20.jpg",
    ],
    status: "Disponible",
    vin: "1GNSKTKL0PR000006",
    location: "Morelos",
    description: "SUV premium High Country con interior de piel, sistema de navegación, asientos calefactados y ventilados, techo panorámico. Motor V8 de alto rendimiento.",
  },
  {
    id: "mg-hs-2024",
    type: "SUV",
    brand: "MG",
    name: "MG HS Excite TA",
    year: 2024,
    price: 224175,
    employeePrice: 179340,
    mileage: "70,000 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/MG_HS_%28second_generation%29_DSC_7234.jpg/640px-MG_HS_%28second_generation%29_DSC_7234.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/MG_HS_%28second_generation%29_DSC_7234.jpg/640px-MG_HS_%28second_generation%29_DSC_7234.jpg",
    ],
    status: "Disponible",
    vin: "LSJW26E97R0000007",
    location: "CDMX",
    description: "SUV compacta con motor turbo, transmisión automática, pantalla táctil de 12.3\", cámara 360°, techo panorámico. Excelente relación precio-equipamiento.",
  },
  {
    id: "dodge-durango-2017",
    type: "SUV",
    brand: "Dodge",
    name: "Dodge Durango Limited",
    year: 2017,
    price: 227250,
    employeePrice: 181800,
    mileage: "170,000 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Dodge_Durango_3.6_Citadel_AWD_2014_%2837106114330%29.jpg/640px-Dodge_Durango_3.6_Citadel_AWD_2014_%2837106114330%29.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Dodge_Durango_3.6_Citadel_AWD_2014_%2837106114330%29.jpg/640px-Dodge_Durango_3.6_Citadel_AWD_2014_%2837106114330%29.jpg",
    ],
    status: "Disponible",
    vin: "1C4RDJDG0HC000008",
    location: "CDMX",
    description: "SUV familiar de 7 pasajeros, versión Limited con asientos de piel, sistema Uconnect, tracción trasera. Motor V6 3.6L Pentastar confiable.",
  },
  {
    id: "mg-rx8-2024",
    type: "SUV",
    brand: "MG",
    name: "MG RX8 SUV Elegance",
    year: 2024,
    price: 339600,
    employeePrice: 271680,
    mileage: "42,300 km",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roewe_RX8_001.jpg/640px-Roewe_RX8_001.jpg",
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Roewe_RX8_001.jpg/640px-Roewe_RX8_001.jpg",
    ],
    status: "Disponible",
    vin: "LSJW36E98R0000009",
    location: "N/A",
    description: "SUV de 7 pasajeros versión Elegance. Motor turbo 2.0T, tracción trasera, pantalla táctil, asientos de piel sintética, amplio espacio de carga. Ideal para familias.",
  },
];

export const fmt = (n: number) => n.toLocaleString("en-US");
