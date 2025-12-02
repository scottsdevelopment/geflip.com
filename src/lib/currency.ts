
export function getCurrencyClass(amount: number): string {
    const absAmount = Math.abs(amount);
    if (absAmount >= 10000) return "coins-10000";
    if (absAmount >= 1000) return "coins-1000";
    if (absAmount >= 250) return "coins-250";
    if (absAmount >= 100) return "coins-100";
    if (absAmount >= 25) return "coins-25";
    if (absAmount >= 5) return "coins-5";
    if (absAmount === 4) return "coins-4";
    if (absAmount === 3) return "coins-3";
    if (absAmount === 2) return "coins-2";
    if (absAmount === 1) return "coins-1";
    return "";
}
