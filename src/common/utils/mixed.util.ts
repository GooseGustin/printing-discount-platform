import { calculateCost } from './cost.util';

/**
 * Calculate cost for both printing and photocopying in a single request.
 */
export function calculateMixed(
  printingPages: number,
  photocopyPages: number,
  remainingPrinting: number,
  remainingPhotocopy: number,
  printingCap: number,
  photocopyCap: number,
  baseCostPrinting: number,
  discountedCostPrinting: number,
  baseCostPhotocopy: number,
  discountedCostPhotocopy: number,
) {
  const printingResult = calculateCost(
    printingPages,
    remainingPrinting,
    printingCap,
    baseCostPrinting,
    discountedCostPrinting,
  );

  const photocopyResult = calculateCost(
    photocopyPages,
    remainingPhotocopy,
    photocopyCap,
    baseCostPhotocopy,
    discountedCostPhotocopy,
  );

  const totalCost =
    printingResult.totalCost + photocopyResult.totalCost;

  return {
    totalCost,
    printing: printingResult,
    photocopy: photocopyResult,
  };
}
