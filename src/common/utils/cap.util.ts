import { Plan } from '@/models/plan.model';

/**
 * Get the weekly cap for printing/photocopy given the current week.
 */
export function getWeeklyCap(
  plan: Plan,
  weekNumber: number,
  serviceType: 'printing' | 'photocopy',
): number {
  if (serviceType === 'printing') {
    return plan.printingWeeklyCaps?.[weekNumber - 1] ?? 0;
  } else {
    return plan.photocopyWeeklyCaps?.[weekNumber - 1] ?? 0;
  }
}
