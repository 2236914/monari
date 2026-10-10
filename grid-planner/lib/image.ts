/**
 * Shrinks an image file to fit within `max`×`max` and returns it as a data URL, so small
 * pictures (brand avatars, the agency logo) can be kept in memory or localStorage without
 * a backend. Rejects files that aren't images or can't be decoded.
 */
export async function resizeImageToDataUrl(file: File, max = 256, type: 'image/png' | 'image/jpeg' = 'image/png'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Error: Choose an image file (PNG, JPG, SVG or WebP).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Error: That image couldn't be opened. Try another file."));
      el.src = url;
    });
    const w = img.naturalWidth || max;
    const h = img.naturalHeight || max;
    const scale = Math.min(1, max / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Error: That image couldn't be opened. Try another file.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(type, 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}
