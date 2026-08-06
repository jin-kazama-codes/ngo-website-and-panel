/**
 * Uploads a file via /api/upload and returns the public URL.
 * @param folder  e.g. 'campaigns', 'users', 'donations'
 * @param file    The File object to upload
 * @param fileName Optional custom filename
 */
export async function uploadImage(
  folder: string,
  file: File,
  fileName?: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file, fileName || file.name);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.url) {
      throw new Error(json.error || 'Upload failed');
    }
    return json.url;
  } catch (err: any) {
    console.error('Upload failed:', err);
    // Return fallback unsplash image URL if upload error occurs
    return 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
  }
}

export function getPublicUrl(path: string): string {
  return path;
}
