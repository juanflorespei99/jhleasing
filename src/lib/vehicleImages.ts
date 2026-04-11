import mgHsExciteFront from "@/assets/vehicles/mg-hs-excite-2022-front.jpg";
import mgHsExciteSide from "@/assets/vehicles/mg-hs-excite-2022-side.jpg";
import mgHsExciteRear from "@/assets/vehicles/mg-hs-excite-2022-rear.jpg";

type VehicleImageFields = {
  slug?: string | null;
  img?: string | null;
  images?: string[] | null;
};

const fallbackImagesBySlug: Record<string, string[]> = {
  "mg-hs-excite-2022": [mgHsExciteFront, mgHsExciteSide, mgHsExciteRear],
};

export function withVehicleImageFallback<T extends VehicleImageFields>(
  vehicle: T,
): T & { img: string; images: string[] };
export function withVehicleImageFallback<T extends VehicleImageFields>(
  vehicle: T | null | undefined,
): (T & { img: string; images: string[] }) | null | undefined;
export function withVehicleImageFallback<T extends VehicleImageFields>(vehicle: T | null | undefined) {
  if (!vehicle) return vehicle;

  const fallbackImages = vehicle.slug ? (fallbackImagesBySlug[vehicle.slug] ?? []) : [];
  const dbImages = Array.isArray(vehicle.images)
    ? vehicle.images.filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    : [];
  const dbPrimaryImage = typeof vehicle.img === "string" ? vehicle.img.trim() : "";

  const resolvedImages = dbImages.length > 0
    ? dbImages
    : dbPrimaryImage
      ? [dbPrimaryImage]
      : fallbackImages;

  const images = resolvedImages.length > 0 ? resolvedImages : ["/placeholder.svg"];
  const img = dbPrimaryImage || images[0];

  return {
    ...vehicle,
    img,
    images,
  };
}
