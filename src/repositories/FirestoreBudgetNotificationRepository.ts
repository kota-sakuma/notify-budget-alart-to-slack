import { Firestore } from '@google-cloud/firestore';
import { IBudgetNotificationRepository } from './IBudgetNotificationRepository';

export class FirestoreBudgetNotificationRepository implements IBudgetNotificationRepository {
  private firestore: Firestore;
  private collectionName: string = 'notifications';

  constructor(firestore: Firestore) {
    this.firestore = firestore;
  }

  async getNotifiedThresholds(
    monthKey: string,
    budgetDisplayName: string
  ): Promise<number[]> {
    const doc = await this.firestore
      .collection(this.collectionName)
      .doc(`${monthKey}-${budgetDisplayName}`)
      .get();

    if (!doc.exists) {
      return [];
    }

    return doc.data()?.notifiedThresholds || [];
  }

  async saveNotifiedThresholds(
    monthKey: string,
    budgetDisplayName: string,
    thresholds: number[]
  ): Promise<void> {
    await this.firestore
      .collection(this.collectionName)
      .doc(`${monthKey}-${budgetDisplayName}`)
      .set({ notifiedThresholds: thresholds }, { merge: true });
  }
}
