import { mkdir, writeFile } from "fs/promises";
import path from "path";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

function hasCloudinaryConfig() {
  return Boolean(cloudName && uploadPreset);
}

async function uploadToCloudinary(file: Express.Multer.File, folder: string) {
  const form = new FormData();
  form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  form.append("upload_preset", uploadPreset!);
  form.append("folder", `trndk/${folder}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const result = await response.json() as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message || "Cloudinary upload failed");
  }

  return result.secure_url;
}

async function saveLocally(file: Express.Multer.File, folder: string) {
  const extension = path.extname(file.originalname).toLowerCase() || ".bin";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  const relativeDirectory = path.join("uploads", folder);
  const absoluteDirectory = path.join(process.cwd(), relativeDirectory);

  await mkdir(absoluteDirectory, { recursive: true });
  await writeFile(path.join(absoluteDirectory, filename), file.buffer);

  return `${relativeDirectory.replaceAll(path.sep, "/")}/${filename}`;
}

/**
 * Stores an uploaded image in Cloudinary when configured, otherwise locally.
 * The local fallback keeps development and existing deployments working.
 */
export async function storeUploadedImage(file: Express.Multer.File, folder: "services" | "banners") {
  if (hasCloudinaryConfig()) {
    return uploadToCloudinary(file, folder);
  }

  return saveLocally(file, folder);
}
