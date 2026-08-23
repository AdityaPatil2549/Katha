/**
 * imageUtils.ts
 * Utility for converting remote images to tiny Base64 strings for offline persistence.
 */

export async function fetchAndCompressImageToBase64(url: string, maxWidth = 300, quality = 0.6): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return null;
    
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    
    const canvas = document.createElement('canvas');
    let width = imageBitmap.width;
    let height = imageBitmap.height;
    
    // Scale down
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(imageBitmap, 0, 0, width, height);
    
    // Convert to webp for maximum compression
    return canvas.toDataURL('image/webp', quality);
  } catch (error) {
    console.error('Failed to compress image to base64:', error);
    return null;
  }
}
