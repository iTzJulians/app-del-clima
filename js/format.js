export function formatTemp(celsius) {
  return `${Math.round(celsius)}°C`;
}

export function capitalize(text) {
  return String(text).charAt(0).toUpperCase() + String(text).slice(1);
}