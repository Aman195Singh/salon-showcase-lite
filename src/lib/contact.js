/**
 * Contact link validator and URL builder helpers.
 * Ensures no broken links (tel:, mailto:, wa.me, #) are ever rendered.
 */

/**
 * Validates a phone number. Must contain at least 7 digits and no placeholder runs ('XXXX').
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (/x{4,}/i.test(trimmed)) return false;
  const digitsOnly = trimmed.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Returns safe `tel:` URI or null if phone is invalid.
 */
export function getPhoneLink(phone) {
  if (!isValidPhone(phone)) return null;
  const sanitized = phone.trim().replace(/[\s\-\(\)]/g, "");
  return `tel:${sanitized}`;
}

/**
 * Validates WhatsApp number. Needs 10 to 15 digits, no placeholder runs ('XXXX').
 */
export function isValidWhatsApp(whatsapp) {
  if (!whatsapp || typeof whatsapp !== "string") return false;
  const trimmed = whatsapp.trim();
  if (/x{4,}/i.test(trimmed)) return false;
  const digitsOnly = trimmed.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Returns safe `https://wa.me/...` URL or null if invalid.
 */
export function getWhatsAppLink(whatsapp) {
  if (!isValidWhatsApp(whatsapp)) return null;
  const digits = whatsapp.trim().replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

/**
 * Validates email address format and rejects placeholder runs ('XXXX').
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (/x{4,}/i.test(trimmed)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Returns safe `mailto:` URI or null if email is invalid.
 */
export function getMailtoLink(email) {
  if (!isValidEmail(email)) return null;
  return `mailto:${email.trim()}`;
}

/**
 * Validates map link: must be a valid http or https URL (not '#' or empty).
 */
export function isValidMapLink(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed === "" || trimmed === "#") return false;
  return /^https?:\/\//i.test(trimmed);
}

/**
 * Returns valid map link or null.
 */
export function getMapLink(url) {
  if (!isValidMapLink(url)) return null;
  return url.trim();
}

/**
 * Returns safe formatted URL for a social platform or website.
 * Prevents javascript: and data: URIs.
 */
export function getSocialLink(platform, url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#" || /x{4,}/i.test(trimmed)) return null;

  // Block dangerous schemes
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) return null;

  if (platform === "whatsapp") {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 10 ? `https://wa.me/${digits}` : null;
  }

  // Prepend https:// if protocol is missing
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

