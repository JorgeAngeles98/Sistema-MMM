import exifr from "exifr";

export interface Exif {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: number;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  dateTaken?: string | Date;
  width?: number;
  height?: number;
  orientation?: number;
  resolution?: number;
  flash?: string;
  gpsLat?: number;
  gpsLng?: number;
}

// Campos descriptivos (IPTC/XMP) que pueden venir incrustados en la imagen.
export interface EmbeddedMeta {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  authorTitle?: string;
  descriptionWriter?: string;
  copyright?: string;
  copyrightUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  credit?: string;
  source?: string;
  headline?: string;
  instructions?: string;
  transmissionRef?: string;
  urgency?: string;
  rating?: number;
  dateCreated?: string;
}

function firstStr(...vals: any[]): string | undefined {
  for (const v of vals) {
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return undefined;
}
function joinArr(...vals: any[]): string | undefined {
  for (const v of vals) {
    if (Array.isArray(v) && v.length) return v.join(", ");
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}
function toLocalInput(d?: string | Date): string | undefined {
  if (!d) return undefined;
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  } catch {
    return undefined;
  }
}

function mapExif(d: any): Exif {
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
}

// Lee EXIF + IPTC + XMP del archivo en el navegador.
export async function readEmbedded(
  file: File
): Promise<{ exif: Exif | null; meta: EmbeddedMeta }> {
  let d: any = {};
  try {
    d =
      (await exifr.parse(file, {
        tiff: true,
        ifd0: true,
        exif: true,
        gps: true,
        iptc: true,
        xmp: true,
      } as any)) || {};
  } catch {
    d = {};
  }
  const exif = mapExif(d);
  const meta: EmbeddedMeta = {
    title: firstStr(d.ObjectName, d.title, d.Title, d.Headline),
    description: firstStr(
      d.ImageDescription,
      d.Caption,
      d["Caption-Abstract"],
      d.description,
      d.Description
    ),
    keywords: joinArr(d.Keywords, d.subject, d.Subject),
    author: firstStr(d.Artist, d.Creator, d.creator, d.Byline, d["By-line"]),
    authorTitle: firstStr(
      d["By-lineTitle"],
      d.AuthorsPosition,
      d.AuthorTitle
    ),
    descriptionWriter: firstStr(
      d["Writer-Editor"],
      d.CaptionWriter,
      d.descriptionWriter
    ),
    copyright: firstStr(d.Copyright, d.rights, d.Rights),
    copyrightUrl: firstStr(d.WebStatement, d.CopyrightInfoURL, d.URL),
    city: firstStr(d.City),
    state: firstStr(d.State, d["Province-State"], d.ProvinceState),
    country: firstStr(
      d.Country,
      d["Country-PrimaryLocationName"],
      d.CountryPrimaryLocationName
    ),
    credit: firstStr(d.Credit),
    source: firstStr(d.Source),
    headline: firstStr(d.Headline),
    instructions: firstStr(
      d.Instructions,
      d["Special-Instructions"],
      d.SpecialInstructions
    ),
    transmissionRef: firstStr(
      d.OriginalTransmissionReference,
      d.TransmissionReference
    ),
    urgency: firstStr(d.Urgency),
    rating: typeof d.Rating === "number" ? d.Rating : undefined,
    dateCreated: toLocalInput(d.DateTimeOriginal || d.CreateDate || d.DateCreated),
  };
  return { exif: hasExif(exif) ? exif : null, meta };
}

export function formatExposure(t?: number): string {
  if (!t) return "—";
  if (t >= 1) return `${t}s`;
  return `1/${Math.round(1 / t)} s`;
}

export function orientationLabel(o?: number): string | undefined {
  if (!o) return undefined;
  const map: Record<number, string> = {
    1: "Normal",
    3: "Rotado 180°",
    6: "Rotado 90° a la derecha",
    8: "Rotado 90° a la izquierda",
  };
  return map[o] ?? String(o);
}

export function hasExif(e?: Exif | null): boolean {
  return !!e && Object.values(e).some((v) => v !== undefined && v !== null);
}
