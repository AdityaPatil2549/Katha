import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<{ compressedFile: File; blurhash: string }> => {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    quality: 0.8
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // Generate a simple blurhash placeholder (in production, use actual blurhash library)
    const blurhash = generateSimpleBlurhash();
    
    return { compressedFile, blurhash };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

const generateSimpleBlurhash = (): string => {
  // Simple placeholder - in production use actual blurhash library
  return 'L6PZfS_.9F~q-;jZ~qjZ~qjZ~qjZ';
};
