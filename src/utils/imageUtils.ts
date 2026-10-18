/**
 * Utility functions for optimized image loading, webp conversion, and fallbacks.
 */

export function getProductImageUrl(img?: string, id?: string): string {
  if (!img) {
    return id ? `/assets/${id}.webp` : '';
  }

  let formatted = img;
  if (formatted.startsWith('../assets/')) {
    formatted = formatted.replace('../assets/', '/assets/');
  } else if (formatted.startsWith('./assets/')) {
    formatted = formatted.replace('./assets/', '/assets/');
  }

  // Optimize local asset PNGs to modern WebP (96%+ file size reduction)
  if (formatted.startsWith('/assets/') && formatted.endsWith('.png')) {
    return formatted.replace(/\.png$/, '.webp');
  }

  return formatted;
}

export function getProductImageFallback(currentSrc: string): string {
  if (currentSrc.endsWith('.webp')) {
    return currentSrc.replace(/\.webp$/, '.png');
  }
  return currentSrc;
}
