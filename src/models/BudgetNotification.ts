export interface BudgetNotification {
  budgetDisplayName: string;
  costAmount: number;
  budgetAmount: number;
  alertThresholdExceeded: number | null;
  currencyCode: string;
}
