import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe tags for rich text content from Tiptap editor.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'a',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
      'class', 'id', 'style',
    ],
    ALLOW_DATA_ATTR: false,
  })
}

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

/** Max file size constants (bytes) */
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024    // 2 MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024      // 5 MB

/**
 * Validates an uploaded file's type and size.
 * Returns null if valid, or an error message string.
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`
  }
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0)
    return `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum: ${maxMB} MB`
  }
  return null
}
