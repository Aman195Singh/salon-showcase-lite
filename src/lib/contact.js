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

/**
 * Resolves a safe Google Maps embed src URL from either:
 * 1. An explicit embed URL or <iframe> HTML snippet
 * 2. A full Google Maps place URL (extracts place ID & coordinates)
 * 3. An address string fallback
 */
export function convertToGoogleMapsEmbed(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // If inside iframe tag
  if (trimmed.includes("<iframe")) {
    const match = trimmed.match(/src=["'](.*?)["']/i);
    if (match && match[1]) {
      return convertToGoogleMapsEmbed(match[1]);
    }
  }

  // If already an embed URL
  if (trimmed.includes("google.com/maps/embed") || (trimmed.includes("output=embed") && !trimmed.includes("/place/"))) {
    return trimmed;
  }

  // Parse place hex ID and coordinates from Google Maps URLs
  const hexMatch = trimmed.match(/!1s(0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+))/);
  const coords3d4d = trimmed.match(/!3d([0-9.-]+)!4d([0-9.-]+)/);
  const placeMatch = trimmed.match(/\/place\/([^\/@?]+)/);

  const placeName = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, " ")) : "";
  const lat = coords3d4d ? coords3d4d[1] : "";
  const lng = coords3d4d ? coords3d4d[2] : "";

  if (hexMatch && lat && lng) {
    const encodedHex = encodeURIComponent(hexMatch[1]);
    const encodedName = encodeURIComponent(placeName || "Location");
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1753.8!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${encodedHex}!2s${encodedName}!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin`;
  }

  if (placeName) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getMapEmbedSrc(customEmbed, address) {
  if (customEmbed && typeof customEmbed === "string" && customEmbed.trim()) {
    const converted = convertToGoogleMapsEmbed(customEmbed);
    if (converted) return converted;
  }

  // If address itself is a Google Maps URL, convert it
  if (address && typeof address === "string") {
    const trimmedAddr = address.trim();
    if (trimmedAddr.includes("google.com/maps") || trimmedAddr.includes("maps.app.goo.gl")) {
      const converted = convertToGoogleMapsEmbed(trimmedAddr);
      if (converted) return converted;
    }
    if (trimmedAddr) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(trimmedAddr)}&output=embed`;
    }
  }

  return `https://maps.google.com/maps?q=Bobby%20Unisex%20Salon,%20Bulandshahr&output=embed`;
}


