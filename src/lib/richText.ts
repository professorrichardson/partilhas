import DOMPurify from 'dompurify'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function normalizeRichText(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  // Quando o conteúdo ainda veio do formato antigo em texto puro,
  // transformamos em HTML básico para manter compatibilidade.
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br />')}</p>`
  }

  return trimmed
}

export function sanitizeRichText(value: string) {
  return DOMPurify.sanitize(normalizeRichText(value), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  })
}

export function richTextToPlainText(value: string) {
  const container = document.createElement('div')
  container.innerHTML = sanitizeRichText(value)
  return container.textContent?.replace(/\s+/g, ' ').trim() || ''
}

export function isRichTextEmpty(value: string) {
  return richTextToPlainText(value).length === 0
}

export function getRichTextExcerpt(value: string, maxLength = 260) {
  const plainText = richTextToPlainText(value)

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
}

export function isRichTextLong(value: string, maxLength = 260) {
  return richTextToPlainText(value).length > maxLength
}
