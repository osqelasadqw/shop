/**
 * Utility functions for image handling
 */

/**
 * Converts an image file to WebP format with specified quality
 * @param file - The original image file
 * @param quality - Quality of the WebP image (0-1), defaults to 0.8
 * @returns Promise with the converted WebP file
 */
export async function convertToWebP(file: File, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    // Check if the file is already a WebP
    if (file.type === 'image/webp') {
      return resolve(file);
    }
    
    // Create image element to load the file
    const img = new Image();
    img.onload = () => {
      // Create a canvas element to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context'));
      }
      ctx.drawImage(img, 0, 0);
      
      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to convert image to WebP'));
          }
          
          // Create a new file with the same name but WebP extension
          const originalName = file.name.split('.').slice(0, -1).join('.');
          const newFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          
          resolve(newFile);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load the image from the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Batch convert multiple image files to WebP format
 * @param files - Array of image files to convert
 * @param quality - Quality of the WebP images (0-1), defaults to 0.8
 * @returns Promise with array of converted WebP files
 */
export async function batchConvertToWebP(files: File[], quality = 0.8): Promise<File[]> {
  const conversionPromises = files.map(file => convertToWebP(file, quality));
  return Promise.all(conversionPromises);
} 