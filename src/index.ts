import { Firestore } from '@google-cloud/firestore';
import { WebClient } from '@slack/web-api';
import { FirestoreBudgetNotificationRepository } from './repositories/FirestoreBudgetNotificationRepository';
import { BudgetNotificationService } from './services/BudgetNotificationService';
import { BudgetNotificationController } from './controllers/BudgetNotificationController';

// Initialize Firestore and Slack API clients
const firestore = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID,
  databaseId: process.env.FIRESTORE_DATABASE_ID,
})
const slackClient = new WebClient(process.env.BOT_ACCESS_TOKEN);
const slackChannel = process.env.SLACK_CHANNEL || 'default-channel';

// Initialize repositories, services, and controllers
const repository = new FirestoreBudgetNotificationRepository(firestore);
const service = new BudgetNotificationService(repository, slackClient, slackChannel);
const controller = new BudgetNotificationController(service);

// Export the controller for use in the Cloud Run Function
export const notifySlack = async (pubsubEvent: any): Promise<void> => {
  await controller.handlePubSubEvent(pubsubEvent);
};
