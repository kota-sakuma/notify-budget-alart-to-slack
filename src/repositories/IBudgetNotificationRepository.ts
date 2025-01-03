export interface IBudgetNotificationRepository {
  getNotifiedThresholds(monthKey: string, budgetDisplayName: string): Promise<number[]>;
  saveNotifiedThresholds(monthKey: string, budgetDisplayName: string, thresholds: number[]): Promise<void>;
}
