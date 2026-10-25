export const DEFAULT_COUNTRY = "ES";
const COUNTRY_EVENT = "mifavorito-country-changed";
const COUNTRY_KEY = "mifavorito-country";

export function getCountrySnapshot() {
  const savedCountry = window.localStorage.getItem(COUNTRY_KEY);
  // Migrate the former US menu choice to Puerto Rico for existing visitors.
  return savedCountry === "US" ? "PR" : savedCountry ?? DEFAULT_COUNTRY;
}

export function getServerCountrySnapshot() {
  return DEFAULT_COUNTRY;
}

export function subscribeToCountry(onChange: () => void) {
  window.addEventListener(COUNTRY_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COUNTRY_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
