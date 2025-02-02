export interface BudgetNotification {
  budgetDisplayName: string;
  costAmount: number;
  costIntervalStart: string;
  budgetAmount: number;
  alertThresholdExceeded: number | null;
  currencyCode: string;
}
