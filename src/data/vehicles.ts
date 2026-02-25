import carTesla from "@/assets/car-tesla.jpg";
import carAudi from "@/assets/car-audi.jpg";
import carBmw from "@/assets/car-bmw.jpg";
import carVw from "@/assets/car-vw.jpg";
import carMini from "@/assets/car-mini.jpg";
import carMercedes from "@/assets/car-mercedes.jpg";

export interface Vehicle {
  id: string;
  type: string;
  name: string;
  year: number;
  price: number;
  mileage: string;
  img: string;
  status: "Disponible" | "Vendido";
  vin: string;
  location: string;
  description: string;
}

export const vehicles: Vehicle[] = [
  {
    id: "tesla-model-3",
    type: "Eléctrico",
    name: "Tesla Model 3",
    year: 2023,
    price: 485000,
    mileage: "32,000 km",
    img: carTesla,
    status: "Disponible",
    vin: "5YJ3E1EA3PF000123",
    location: "Ciudad de México, CDMX",
    description: "Vehículo eléctrico de flotilla corporativa en excelentes condiciones. Interior premium, Autopilot incluido, batería con garantía vigente. Servicio completo en agencia.",
  },
  {
    id: "audi-q5",
    type: "SUV",
    name: "Audi Q5",
    year: 2022,
    price: 620000,
    mileage: "45,000 km",
    img: carAudi,
    status: "Disponible",
    vin: "WAUZZZ8R7NA012345",
    location: "Monterrey, NL",
    description: "SUV premium de flotilla ejecutiva. Tracción integral Quattro, asientos de piel, navegación, techo panorámico. Mantenimiento al corriente en agencia autorizada.",
  },
  {
    id: "bmw-3-series",
    type: "Sedán",
    name: "BMW 3 Series",
    year: 2023,
    price: 540000,
    mileage: "28,000 km",
    img: carBmw,
    status: "Disponible",
    vin: "WBA5R1C50PFH00456",
    location: "Guadalajara, JAL",
    description: "Sedán deportivo de línea ejecutiva. Motor turbo de 4 cilindros, transmisión automática de 8 velocidades, paquete M Sport. Historial de servicio completo.",
  },
  {
    id: "vw-passat",
    type: "Sedán",
    name: "VW Passat",
    year: 2021,
    price: 320000,
    mileage: "51,000 km",
    img: carVw,
    status: "Disponible",
    vin: "WVWZZZ3CZNE789012",
    location: "Puebla, PUE",
    description: "Sedán amplio y confortable de flotilla corporativa. Motor TSI turbo, asientos de piel, sistema de infoentretenimiento con Apple CarPlay. Excelente relación precio-valor.",
  },
  {
    id: "mini-cooper",
    type: "Compacto",
    name: "Mini Cooper",
    year: 2022,
    price: 390000,
    mileage: "38,000 km",
    img: carMini,
    status: "Disponible",
    vin: "WMWXP5C58N2T34567",
    location: "Ciudad de México, CDMX",
    description: "Compacto icónico con personalidad única. Motor turbo eficiente, transmisión automática, techo panorámico, sistema de navegación. Perfecto para ciudad.",
  },
  {
    id: "mercedes-c",
    type: "Lujo",
    name: "Mercedes C",
    year: 2023,
    price: 720000,
    mileage: "22,000 km",
    img: carMercedes,
    status: "Disponible",
    vin: "W1KZF8DB1PA890123",
    location: "Monterrey, NL",
    description: "Sedán de lujo de flotilla directiva. Interior AMG Line, sistema MBUX con pantalla táctil, suspensión deportiva, asistente de conducción activo. El menor kilometraje del inventario.",
  },
];

export const fmt = (n: number) => n.toLocaleString("en-US");
