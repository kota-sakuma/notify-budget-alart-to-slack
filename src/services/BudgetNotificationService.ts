import { IBudgetNotificationRepository } from '../repositories/IBudgetNotificationRepository';
import { BudgetNotification } from '../models/BudgetNotification';
import { WebClient } from '@slack/web-api';

export class BudgetNotificationService {
  private repository: IBudgetNotificationRepository;
  private slackClient: WebClient;
  private notificationThresholds: number[];
  private slackChannel: string;

  constructor(
    repository: IBudgetNotificationRepository,
    slackClient: WebClient,
    slackChannel: string,
    notificationThresholds: number[] = [0.5, 0.8, 1.0]
 ) {
    this.repository = repository;
    this.slackClient = slackClient;
    this.notificationThresholds = notificationThresholds;
    this.slackChannel = slackChannel;
  }

  private generateMonthKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // add 1 because getUTCMonth() returns 0-11
    return `${year}-${month}`;
  }

  async processNotification(pubsubData: BudgetNotification): Promise<string> {
    const { budgetDisplayName, budgetAmount, costAmount, costIntervalStart } = pubsubData;
    const currentThreshold = costAmount / budgetAmount;
    const date = new Date(costIntervalStart);
    const monthKey = this.generateMonthKey(date);

    const notifiedThresholds = await this.repository.getNotifiedThresholds(
      monthKey,
      budgetDisplayName
    );

    const thresholdToNotify = this.findThresholdToNotify(
      currentThreshold,
      notifiedThresholds,
      this.notificationThresholds
    );

    // Exit early if no threshold is found
    if (await this.isNotificationNotRequired(thresholdToNotify)) {
      return 'No notification required';
    };

    const messageBlocks = this.createSlackMessage(pubsubData, thresholdToNotify);

    await this.slackClient.chat.postMessage({
      channel: this.slackChannel,
      blocks: messageBlocks,
    });

    notifiedThresholds.push(thresholdToNotify);
    await this.repository.saveNotifiedThresholds(
      monthKey,
      budgetDisplayName,
      notifiedThresholds
    );

    console.log('Notification sent');

    return 'Slack notification sent successfully';
  }

  private createSlackMessage(
    pubsubData: BudgetNotification,
    threshold: number
  ): any[] {
    const { budgetDisplayName, costAmount, budgetAmount, currencyCode } = pubsubData;
    return [
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "🚨 " },
              { type: "text", text: "予算アラート\n", style: { bold: true } }
            ]
          },
          {
            type: "rich_text_list",
            style: "bullet",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: "プロジェクト ID: biz-toshiba-tec-dev" }
                ]
              },
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: `予算名: ${budgetDisplayName}` }
                ]
              }
            ]
          }
        ]
      },
      {
        type: "section",
        text: { type: "plain_text", text: "\n", emoji: true }
      },
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "💰 " },
              { type: "text", text: "利用料金\n", style: { bold: true } }
            ]
          },
          {
            type: "rich_text_list",
            style: "bullet",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: `現在の利用料金 (今月分): ${costAmount} ${currencyCode}` }
                ]
              },
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: `設定予算: ${budgetAmount} ${currencyCode}` }
                ]
              }
            ]
          }
        ]
      },
      {
        type: "section",
        text: { type: "plain_text", text: "\n", emoji: true }
      },
      {
        type: "rich_text",
        elements: [
          {
            type: "rich_text_section",
            elements: [
              { type: "text", text: "⚠️ " },
              { type: "text", text: "しきい値\n", style: { bold: true } }
            ]
          },
          {
            type: "rich_text_list",
            style: "bullet",
            elements: [
              {
                type: "rich_text_section",
                elements: [
                  { type: "text", text: `${threshold * 100}% 超過` }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  // Return -1 if no threshold is found
  private findThresholdToNotify(
    currentThreshold: number,
    notifiedThresholds: number[],
    notificationThresholds: number[],
    defaultThreshold: number = -1
  ): number {
    return (
      notificationThresholds.find(
        (threshold) =>
          currentThreshold >= threshold && !notifiedThresholds.includes(threshold)
      ) ?? defaultThreshold
    );
  }

  async isNotificationNotRequired(
    thresholdToNotify: number
  ): Promise<boolean> {
    if (thresholdToNotify === -1) {
      console.log('No notification required');
      return true;
    }

    console.log('Notification required for threshold:', thresholdToNotify);
    return false;
  }
}