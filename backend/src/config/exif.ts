import exifr from "exifr";
import { IExif } from "../models/File";

// Lee los metadatos EXIF/cámara de una imagen (ruta o buffer). Null si no aplica.
export async function readExif(
  input: string | Buffer
): Promise<IExif | null> {
  try {
    const d: any = await exifr.parse(input as any, {
      tiff: true,
      ifd0: true,
      exif: true,
      gps: true,
    } as any);
    if (!d) return null;
    return {
      make: d.Make,
      model: d.Model,
      lens: d.LensModel || d.Lens,
      focalLength: d.FocalLength,
      fNumber: d.FNumber,
      exposureTime: d.ExposureTime,
      iso: d.ISO,
      dateTaken: d.DateTimeOriginal || d.CreateDate,
      width: d.ImageWidth || d.ExifImageWidth,
      height: d.ImageHeight || d.ExifImageHeight,
      orientation: d.Orientation,
      resolution: d.XResolution,
      flash:
        typeof d.Flash === "string"
          ? d.Flash
          : d.Flash != null
          ? String(d.Flash)
          : undefined,
      gpsLat: d.latitude,
      gpsLng: d.longitude,
    };
  } catch {
    return null;
  }
}
