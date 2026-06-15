import multer from "multer";
import path from "path";
import fs from "fs";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Carpeta local (modo desarrollo / sin nube).
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const {
  S3_BUCKET,
  S3_ENDPOINT,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_URL,
} = process.env;
const S3_REGION = process.env.S3_REGION || "auto";

// Si hay credenciales de almacenamiento (Cloudflare R2 / S3), usa la nube.
export const useCloud = !!(
  S3_BUCKET &&
  S3_ACCESS_KEY_ID &&
  S3_SECRET_ACCESS_KEY &&
  S3_PUBLIC_URL
);

if (!useCloud) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const client = useCloud
  ? new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID as string,
        secretAccessKey: S3_SECRET_ACCESS_KEY as string,
      },
    })
  : null;

// En la nube usamos memoria (para subir el buffer); en local, disco.
const storage = useCloud
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    });

export const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Guarda el archivo subido y devuelve su "storedName" (key o nombre en disco).
export async function persistUpload(
  file: Express.Multer.File
): Promise<string> {
  if (useCloud && client) {
    const key = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(
      file.originalname
    )}`;
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    return key;
  }
  // diskStorage ya escribió el archivo
  return file.filename;
}

// URL pública del archivo (absoluta en la nube, relativa en local).
export function fileUrl(storedName: string): string {
  return useCloud
    ? `${(S3_PUBLIC_URL as string).replace(/\/+$/, "")}/${storedName}`
    : `/uploads/${storedName}`;
}

// Borra el archivo del storage (nube o disco), sin lanzar error.
export async function removeStoredFile(storedName?: string): Promise<void> {
  if (!storedName) return;
  if (useCloud && client) {
    try {
      await client.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: storedName })
      );
    } catch {
      /* ignore */
    }
  } else {
    try {
      fs.unlinkSync(path.join(UPLOAD_DIR, storedName));
    } catch {
      /* ignore */
    }
  }
}

// Devuelve el contenido del archivo (para leer EXIF).
export async function fileBufferFor(
  file: Express.Multer.File
): Promise<Buffer | null> {
  try {
    if (useCloud) return file.buffer ?? null;
    return fs.readFileSync(path.join(UPLOAD_DIR, file.filename));
  } catch {
    return null;
  }
}
