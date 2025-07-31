import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateStatusDto } from './dto';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/activity',
})
export class ActivityGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: number; socketId: string }>();

  constructor(private activityService: ActivityService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // 这里可以添加身份验证逻辑
    // const userId = await this.authenticateSocket(client);
    // if (userId) {
    //   this.connectedUsers.set(client.id, { userId, socketId: client.id });
    //   client.join(`user_${userId}`);
    // }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      // 更新用户状态为离线
      await this.activityService.updateUserStatus(userInfo.userId, {
        currentStatus: 'OFFLINE' as any,
        lastActivity: new Date().toISOString(),
      });
      
      this.connectedUsers.delete(client.id);
      
      // 通知其他用户该用户已离线
      this.server.emit('user_status_changed', {
        userId: userInfo.userId,
        status: 'OFFLINE',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ==================== 客户端事件处理 ====================

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; token?: string }
  ) {
    try {
      // 这里应该验证token的有效性
      // const isValid = await this.validateToken(data.token);
      // if (!isValid) {
      //   client.emit('auth_error', { message: 'Invalid token' });
      //   return;
      // }

      this.connectedUsers.set(client.id, { 
        userId: data.userId, 
        socketId: client.id 
      });
      
      client.join(`user_${data.userId}`);
      
      // 更新用户状态为在线
      await this.activityService.updateUserStatus(data.userId, {
        currentStatus: 'ACTIVE' as any,
        lastActivity: new Date().toISOString(),
      });

      client.emit('authenticated', { 
        success: true, 
        userId: data.userId 
      });

      // 通知其他用户该用户已上线
      this.server.emit('user_status_changed', {
        userId: data.userId,
        status: 'ACTIVE',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      client.emit('auth_error', { message: error.message });
    }
  }

  @SubscribeMessage('report_activity')
  async handleReportActivity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateActivityDto
  ) {
    try {
      const userInfo = this.connectedUsers.get(client.id);
      if (!userInfo) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const activity = await this.activityService.createActivity(userInfo.userId, data);
      
      // 向该用户发送确认
      client.emit('activity_recorded', { 
        success: true, 
        activity 
      });

      // 向所有连接的客户端广播活动更新（可选，根据隐私需求）
      this.server.emit('activity_update', {
        userId: userInfo.userId,
        activityType: data.activityType,
        applicationName: data.applicationName,
        timestamp: data.startTime,
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('update_status')
  async handleUpdateStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateStatusDto
  ) {
    try {
      const userInfo = this.connectedUsers.get(client.id);
      if (!userInfo) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const status = await this.activityService.updateUserStatus(userInfo.userId, data);
      
      // 向该用户发送确认
      client.emit('status_updated', { 
        success: true, 
        status 
      });

      // 向所有连接的客户端广播状态更新
      this.server.emit('user_status_changed', {
        userId: userInfo.userId,
        status: data.currentStatus,
        currentApp: data.currentApp,
        currentWindow: data.currentWindow,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('get_active_users')
  async handleGetActiveUsers(@ConnectedSocket() client: Socket) {
    try {
      const activeUsers = await this.activityService.getAllActiveUsers();
      
      client.emit('active_users', {
        success: true,
        data: activeUsers,
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('subscribe_to_user')
  async handleSubscribeToUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: number }
  ) {
    try {
      const userInfo = this.connectedUsers.get(client.id);
      if (!userInfo) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // 这里可以添加权限检查
      // const canSubscribe = await this.checkSubscriptionPermission(userInfo.userId, data.targetUserId);
      // if (!canSubscribe) {
      //   client.emit('error', { message: 'Permission denied' });
      //   return;
      // }

      client.join(`user_${data.targetUserId}_subscribers`);
      
      client.emit('subscribed', { 
        success: true, 
        targetUserId: data.targetUserId 
      });

    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // ==================== 服务端主动推送方法 ====================

  async broadcastUserActivity(userId: number, activity: any) {
    this.server.emit('user_activity_broadcast', {
      userId,
      activity,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyUserStatusChange(userId: number, status: any) {
    this.server.emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  async sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  async sendToUserSubscribers(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}_subscribers`).emit(event, data);
  }

  // ==================== 辅助方法 ====================

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  getConnectedUsers(): Array<{ userId: number; socketId: string }> {
    return Array.from(this.connectedUsers.values());
  }

  isUserConnected(userId: number): boolean {
    return Array.from(this.connectedUsers.values()).some(user => user.userId === userId);
  }
}
