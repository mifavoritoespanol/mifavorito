export const COUNTRIES = [
  { code: "ES", name: "España" }, { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" }, { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" }, { code: "PE", name: "Perú" },
  { code: "VE", name: "Venezuela" }, { code: "EC", name: "Ecuador" },
  { code: "GT", name: "Guatemala" }, { code: "CU", name: "Cuba" },
  { code: "BO", name: "Bolivia" }, { code: "DO", name: "República Dominicana" },
  { code: "HN", name: "Honduras" }, { code: "PY", name: "Paraguay" },
  { code: "SV", name: "El Salvador" }, { code: "NI", name: "Nicaragua" },
  { code: "CR", name: "Costa Rica" }, { code: "PA", name: "Panamá" },
  { code: "UY", name: "Uruguay" }, { code: "GQ", name: "Guinea Ecuatorial" },
  { code: "US", name: "Estados Unidos" },
] as const;

export function countryFlag(code: string) {
  return String.fromCodePoint(...[...code.toUpperCase()].map((letter) => 127397 + letter.charCodeAt(0)));
}

export function countryName(code: string) {
  return COUNTRIES.find((country) => country.code === code)?.name ?? code;
}
