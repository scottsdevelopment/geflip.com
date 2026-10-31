// Grand Exchange sales tax (since 29 May 2025): 2% of the sale price, rounded down,
// capped at 5,000,000 coins per item. Items sold for under 50 gp therefore pay no tax.
// https://oldschool.runescape.wiki/w/Grand_Exchange#Convenience_fee_and_item_sink
// Note: a small list of items (bonds, some tools/teleports/food) is fully exempt; not modelled here.
export const GE_TAX_RATE = 0.02;
export const GE_TAX_CAP = 5_000_000;

export function geTax(price: number): number {
    if (!Number.isFinite(price) || price <= 0) return 0;
    return Math.min(Math.floor(price * GE_TAX_RATE), GE_TAX_CAP);
}

/** Coins received per item after GE tax when selling at `price`. */
export function afterTax(price: number): number {
    return price - geTax(price);
}
