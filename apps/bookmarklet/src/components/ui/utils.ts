type ClassValue = string | null | undefined | false;

export const cn = (...values: ClassValue[]) =>
  values.filter(Boolean).join(" ");
