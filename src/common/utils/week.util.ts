import { Subscription } from '@/models/subscription.model';

/**
 * Get the current week number of the subscription based on startDate.
 */
export function getCurrentWeek(subscription: Subscription): number {
  if (!subscription.startDate) return subscription.weekNumber || 1;

  const start = new Date(subscription.startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

  return Math.max(1, subscription.weekNumber || 1 + diffWeeks);
}
