export const UNITS = [
  "g", "kg", "oz", "lb", 
  "ml", "l", "fl oz", "cup", 
  "tsp", "tbsp", "piece", "each"
] as const;

export const CURRENCY_SYMBOL = "$";
export const DEFAULT_MARGIN = 100;
export const MAX_MARGIN = 1000;
export const MIN_MARGIN = 0;

export const STORAGE_KEY = "sellsheet-data";

export const APP_NAME = "SellSheet";
export const APP_TAGLINE = "Profit Calculator";

export const EXPORT_FORMATS = {
  PDF: "pdf",
  CSV: "csv"
} as const;
