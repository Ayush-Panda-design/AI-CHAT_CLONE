export function isValidImage(dataUrl: string, maxSizeMB: number = 2): boolean {
  if (!dataUrl.startsWith("data:image/")) return false;
  
  // Estimate size of base64 string
  // A base64 string length is roughly 4/3 of the original size.
  const sizeInBytes = (dataUrl.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  return sizeInMB <= maxSizeMB;
}
