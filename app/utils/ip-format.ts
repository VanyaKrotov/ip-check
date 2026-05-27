export function joinDefined(...values: Array<string | undefined | null>) {
  return values.filter(Boolean).join(", ");
}

export function coordinateValue(lat?: number, lon?: number) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    return undefined;
  }

  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

export function booleanValue(value: boolean | undefined, t: (key: string) => string) {
  if (typeof value !== "boolean") {
    return undefined;
  }

  return value ? t("yes") : t("no");
}
