import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private expo: Expo;

  constructor(private databaseService: DatabaseService) {
    // 初始化 Expo Push Client
    this.expo = new Expo();
  }

  async registerToken(userId: string, registerTokenDto: RegisterTokenDto) {
    // 檢查 token 是否已存在
    const existing = await this.databaseService.pushToken.findUnique({
      where: { token: registerTokenDto.token },
    });

    if (existing) {
      // 更新現有 token
      if (existing.appUserId !== userId) {
        // Token 被另一個用戶使用，更新為當前用戶
        return this.databaseService.pushToken.update({
          where: { token: registerTokenDto.token },
          data: {
            appUserId: userId,
            deviceInfo: registerTokenDto.deviceInfo,
            isActive: true,
            updatedAt: new Date(),
          },
        });
      }
      return existing;
    }

    // 創建新 token
    return this.databaseService.pushToken.create({
      data: {
        appUserId: userId,
        token: registerTokenDto.token,
        deviceInfo: registerTokenDto.deviceInfo,
        isActive: true,
      },
    });
  }

  async removeToken(token: string) {
    const existing = await this.databaseService.pushToken.findUnique({
      where: { token },
    });

    if (!existing) {
      return { success: true, message: 'Token not found' };
    }

    await this.databaseService.pushToken.delete({
      where: { token },
    });

    return { success: true, message: 'Token removed' };
  }

  async getUserTokens(userId: string) {
    return this.databaseService.pushToken.findMany({
      where: {
        appUserId: userId,
        isActive: true,
      },
    });
  }

  async getTenantMemberTokens(tenantId: string) {
    const members = await this.databaseService.tenantMember.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
      },
      include: {
        appUser: {
          include: {
            pushTokens: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const tokens: string[] = [];
    members.forEach((member) => {
      member.appUser.pushTokens.forEach((token) => {
        tokens.push(token.token);
      });
    });

    return tokens;
  }

  // 發送推送通知
  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    if (tokens.length === 0) {
      this.logger.warn('No push tokens provided');
      return {
        success: true,
        sentCount: 0,
        message: 'No tokens to send',
      };
    }

    this.logger.log(
      `Sending push notification to ${tokens.length} devices: ${title}`,
    );

    try {
      // 準備消息
      const messages: ExpoPushMessage[] = [];
      
      for (const pushToken of tokens) {
        // 檢查 token 是否有效
        if (!Expo.isExpoPushToken(pushToken)) {
          this.logger.warn(`Invalid push token: ${pushToken}`);
          continue;
        }

        messages.push({
          to: pushToken,
          sound: 'default',
          title,
          body,
          data: data || {},
          priority: 'high',
          channelId: 'alert', // Android 通知頻道
        });
      }

      if (messages.length === 0) {
        this.logger.warn('No valid push tokens');
        return {
          success: false,
          sentCount: 0,
          message: 'No valid tokens',
        };
      }

      // 分批發送（Expo 建議每批最多 100 條）
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          this.logger.log(`Sent ${chunk.length} notifications`);
        } catch (error) {
          this.logger.error(`Error sending push notification chunk: ${error.message}`);
        }
      }

      // 記錄發送結果
      const successCount = tickets.filter((ticket) => ticket.status === 'ok').length;
      const errorCount = tickets.filter((ticket) => ticket.status === 'error').length;

      this.logger.log(
        `Push notification results: ${successCount} success, ${errorCount} errors`,
      );

      return {
        success: true,
        sentCount: successCount,
        errorCount,
        message: `Push notifications sent: ${successCount} success, ${errorCount} errors`,
      };
    } catch (error) {
      this.logger.error(`Send push notification error: ${error.message}`);
      return {
        success: false,
        sentCount: 0,
        message: error.message,
      };
    }
  }

  async sendAlertNotification(alertId: string) {
    const alert = await this.databaseService.alert.findUnique({
      where: { id: alertId },
      include: {
        elder: {
          select: { name: true },
        },
        assignments: {
          include: {
            appUser: {
              include: {
                pushTokens: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    if (!alert) {
      this.logger.warn(`Alert ${alertId} not found`);
      return { success: false, message: 'Alert not found' };
    }

    const tokens: string[] = [];
    alert.assignments.forEach((assignment) => {
      assignment.appUser.pushTokens.forEach((token) => {
        tokens.push(token.token);
      });
    });

    if (tokens.length === 0) {
      this.logger.warn(`No push tokens found for alert ${alertId}`);
      return { success: true, sentCount: 0, message: 'No tokens to send' };
    }

    const title = `${alert.type} 警報`;
    const body = `${alert.elder.name} - ${alert.message}`;

    return this.sendPushNotification(tokens, title, body, {
      alertId: alert.id,
      type: 'alert',
    });
  }
}
