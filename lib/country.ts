export const DEFAULT_COUNTRY = "ES";
const COUNTRY_EVENT = "mifavorito-country-changed";
const COUNTRY_KEY = "mifavorito-country";

export function getCountrySnapshot() {
  return window.localStorage.getItem(COUNTRY_KEY) ?? DEFAULT_COUNTRY;
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
