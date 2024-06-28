import Decimal from "decimal.js";

export const altcoinTypeCast = (field: any, next: () => void) => {
  if (field.type === "DECIMAL" || field.type === "NEWDECIMAL") {
    const fieldString = field.string() as string;

    if (!fieldString) {
      return null;
    }

    return new Decimal(fieldString).toNumber();
  }

  if (field.type === "BIT" && field.length === 1) {
    const bytes = field.buffer();

    return bytes[0] === 1;
  }

  return next();
}
