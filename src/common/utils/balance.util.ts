import { Subscription } from '@/models/subscription.model';

/**
 * Deduct discounted pages from the subscription balance.
 */
export function deductBalance(
  subscription: Subscription,
  serviceType: 'printing' | 'photocopy',
  discountedPages: number,
): Subscription {
  if (serviceType === 'printing') {
    subscription.remainingPrintingPages = Math.max(
      subscription.remainingPrintingPages - discountedPages,
      0,
    );
  } else {
    subscription.remainingPhotocopyPages = Math.max(
      subscription.remainingPhotocopyPages - discountedPages,
      0,
    );
  }

  return subscription;
}
