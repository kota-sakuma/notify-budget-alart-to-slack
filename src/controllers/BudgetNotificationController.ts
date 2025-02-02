import { BudgetNotificationService } from '../services/BudgetNotificationService';
import { BudgetNotification } from '../models/BudgetNotification';

export class BudgetNotificationController {
  private service: BudgetNotificationService;

  constructor(service: BudgetNotificationService) {
    this.service = service;
  }

  async handlePubSubEvent(pubsubEvent: any): Promise<void> {
    try {
      // Decode the PubSub Message.
      const pubsubData: BudgetNotification = JSON.parse(
        Buffer.from(pubsubEvent.data, 'base64').toString('utf-8')
      );

      const result = await this.service.processNotification(pubsubData);
    } catch (err) {
      console.error('Error processing PubSub event:', err);
      throw new Error('Error processing PubSub event');
    }
  }
}