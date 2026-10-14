/**
 * Extracts the numeric amount from UI price labels such as "$29.99", "Item total: $39.98" or "Tax: $3.20".
 * Throws on anything unparseable so a broken label fails loudly instead of being compared as NaN.
 */
export function parsePrice(text: string): number {
  const match = /\$(\d+(?:\.\d{1,2})?)/.exec(text);
  if (!match?.[1]) {
    throw new Error(`Cannot parse a price from "${text}"`);
  }
  return Number(match[1]);
}

/** Sums prices in cents to avoid floating-point drift (0.1 + 0.2 !== 0.3). */
export function sumPrices(prices: readonly number[]): number {
  return prices.reduce((total, price) => total + Math.round(price * 100), 0) / 100;
}
