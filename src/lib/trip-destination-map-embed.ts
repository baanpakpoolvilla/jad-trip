/** URL สำหรับ iframe แผนที่ Google Maps (ฝัง) — ใช้พิกัดโดยตรง ไม่ต้องมี API key */
export function tripDestinationMapEmbedUrl(lat: number, lon: number, zoom = 14): string {
  return `https://www.google.com/maps?q=${lat},${lon}&z=${zoom}&hl=th&output=embed`;
}

/** เปิดในแท็บ Google Maps (เต็มหน้า) */
export function tripDestinationGoogleMapsWebUrl(lat: number, lon: number, zoom = 14): string {
  return `https://www.google.com/maps?q=${lat},${lon}&z=${zoom}&hl=th`;
}
