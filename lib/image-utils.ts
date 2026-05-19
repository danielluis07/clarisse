export const readImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      cleanup();
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      cleanup();
    };

    img.src = objectUrl;
  });
};
