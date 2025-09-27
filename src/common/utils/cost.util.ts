/**
 * Calculate discounted vs full price cost for a service.
 */
export function calculateCost(
  pages: number,
  remaining: number,
  cap: number,
  baseCost: number,
  discountedCost: number,
) {
  const discountedPages = Math.min(pages, remaining, cap);
  const fullPricePages = pages - discountedPages;

  const cost =
    discountedPages * discountedCost + fullPricePages * baseCost;

  return {
    discountedPages,
    fullPricePages,
    totalCost: cost,
  };
}
