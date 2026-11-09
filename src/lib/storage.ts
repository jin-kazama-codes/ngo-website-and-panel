/**
 * Client-side image compression using browser Canvas.
 * Automatically downscales large phone camera pictures (e.g. 5MB-15MB)
 * to max 1280px dimension at 82% JPEG quality (~150KB-250KB).
 */
export async function compressImageFile(file: File, maxDimension = 1280, quality = 0.82): Promise<File> {
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return file;
  }
  // Only compress raster images; keep PDF or SVG untouched
  if (!file.type.startsWith('image/') || file.type.includes('svg')) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          );
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file via /api/upload to Supabase Storage and returns the public HTTPS URL.
 * Never falls back to third-party or stock photos — preserves the user's actual image.
 *
 * @param folder   e.g. 'users', 'receipts', 'kyc', 'campaigns'
 * @param file     The File object to upload
 * @param fileName Optional custom filename
 */
export async function uploadImage(
  folder: string,
  file: File,
  fileName?: string
): Promise<string> {
  // 1. Compress image client-side to prevent HTTP 413 payload limit and slow network uploads
  let fileToUpload = file;
  try {
    fileToUpload = await compressImageFile(file);
  } catch (compErr) {
    console.warn('Image compression skipped, uploading original:', compErr);
  }

  try {
    const formData = new FormData();
    formData.append('file', fileToUpload, fileName || fileToUpload.name);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.url) {
      throw new Error(json.error || 'Upload failed');
    }

    return json.url;
  } catch (err: any) {
    console.warn('Supabase storage API upload failed, falling back to base64 data URL:', err?.message || err);

    // Fallback: encode the user's actual compressed image as a base64 Data URL.
    // This guarantees the user's real uploaded photo is preserved in the database.
    try {
      const dataUrl = await fileToDataUrl(fileToUpload);
      return dataUrl;
    } catch (dataUrlErr) {
      console.error('Failed to convert file to data URL fallback:', dataUrlErr);
      throw new Error('Image upload failed. Please try a different photo or check your network connection.');
    }
  }
}

export function getPublicUrl(path: string): string {
  return path;
}
