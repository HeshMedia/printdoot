// Helper functions for image handling
export const PLACEHOLDER_IMAGE = '/placeholder-product.png';

/**
 * Get a safe image URL with a fallback to a placeholder
 * This helps prevent client-side exceptions when no image is available
 * 
 * @param imageUrl - The original image URL or null/undefined
 * @returns A valid image URL using the original or a placeholder
 */
export function getSafeImageUrl(imageUrl: string | null | undefined): string {
  // Make sure we return a string, not null or undefined
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE;
  }
  
  return imageUrl;
}

/**
 * Error handler for regular img tag loading errors
 * Sets the target's source to the placeholder image
 * 
 * @param event - The error event from an image element
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const target = event.target as HTMLImageElement;
  target.onerror = null; // Prevent infinite loops
  target.src = PLACEHOLDER_IMAGE;
}

/**
 * Get a safe image source for Next.js Image component
 * This is different from getSafeImageUrl as it needs to handle
 * the way Next.js processes images
 * 
 * @param imageUrl - The original image URL or null/undefined
 * @returns A valid image URL using the original or a placeholder
 */
export function getNextImageSrc(imageUrl: string | null | undefined): string {
  // Make sure we return a string, not null or undefined
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE;
  }
  
  // If this is an external URL (starts with http), return it as is
  if (imageUrl?.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise ensure it starts with a slash for local images
  if (!imageUrl?.startsWith('/')) {
    return `/${imageUrl}`;
  }
  
  return imageUrl;
}
