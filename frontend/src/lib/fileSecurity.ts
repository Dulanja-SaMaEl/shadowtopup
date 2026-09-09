import path from 'path';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  safeExtension?: string;
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates an uploaded image by checking:
 * 1. File size limit
 * 2. Whitelisted file extension
 * 3. File magic bytes (header signatures) to prevent file extension spoofing & stored XSS (SVG, HTML, polyglot)
 */
export function validateImageUpload(
  fileName: string,
  buffer: Buffer,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES
): ValidationResult {
  // 1. File size check
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file provided.' };
  }

  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB.`,
    };
  }

  // 2. Extension check
  const ext = path.extname(fileName || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: 'Invalid file extension. Only JPEG (.jpg, .jpeg), PNG (.png), and WebP (.webp) images are allowed.',
    };
  }

  // 3. Magic Bytes (Signature) Verification
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  const isWebP =
    buffer.length >= 12 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50; // P

  if (!isJpeg && !isPng && !isWebP) {
    return {
      valid: false,
      error: 'File content does not match genuine image magic bytes. Executables, scripts, and SVG vectors are prohibited.',
    };
  }

  const verifiedExt = isPng ? '.png' : isWebP ? '.webp' : '.jpg';

  return {
    valid: true,
    safeExtension: verifiedExt,
  };
}

/**
 * Sanitizes a file base name to prevent directory traversal and special character injection
 */
export function sanitizeFileName(fileName: string): string {
  const ext = path.extname(fileName || '').toLowerCase();
  const baseName = path.basename(fileName, ext);
  const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  return `${Date.now()}_${cleanBase || 'upload'}${ext}`;
}
