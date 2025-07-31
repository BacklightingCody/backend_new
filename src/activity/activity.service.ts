import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, UpdateStatusDto } from './dto';
import { UserActivity, UserActivityStatus, ActivityStatus, ActivityType } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  // ==================== 活动记录管理 ====================

  async createActivity(userId: number, createActivityDto: CreateActivityDto): Promise<UserActivity> {
    const activity = await this.prisma.userActivity.create({
      data: {
        ...createActivityDto,
        userId,
        startTime: new Date(createActivityDto.startTime),
        endTime: createActivityDto.endTime ? new Date(createActivityDto.endTime) : null,
      },
    });

    // 更新用户状态
    await this.updateUserStatus(userId, {
      currentStatus: this.getStatusFromActivityType(createActivityDto.activityType),
      lastActivity: createActivityDto.startTime,
      currentApp: createActivityDto.applicationName,
      currentWindow: createActivityDto.windowTitle,
    });

    return activity;
  }

  async findUserActivities(
    userId: number, 
    limit: number = 50, 
    offset: number = 0,
    startDate?: string,
    endDate?: string
  ): Promise<UserActivity[]> {
    const where: any = { userId };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    return this.prisma.userActivity.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findActivityById(activityId: string, userId: number): Promise<UserActivity> {
    const activity = await this.prisma.userActivity.findFirst({
      where: { id: activityId, userId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async updateActivity(activityId: string, userId: number, updateData: Partial<CreateActivityDto>): Promise<UserActivity> {
    await this.findActivityById(activityId, userId);

    const updatePayload: any = { ...updateData };
    if (updateData.startTime) updatePayload.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updatePayload.endTime = new Date(updateData.endTime);

    return this.prisma.userActivity.update({
      where: { id: activityId },
      data: updatePayload,
    });
  }

  async deleteActivity(activityId: string, userId: number): Promise<void> {
    await this.findActivityById(activityId, userId);
    
    await this.prisma.userActivity.delete({
      where: { id: activityId },
    });
  }

  // ==================== 用户状态管理 ====================

  async getUserStatus(userId: number): Promise<UserActivityStatus> {
    let status = await this.prisma.userActivityStatus.findUnique({
      where: { userId },
    });

    if (!status) {
      // 创建默认状态
      status = await this.prisma.userActivityStatus.create({
        data: {
          userId,
          currentStatus: ActivityStatus.OFFLINE,
        },
      });
    }

    return status;
  }

  async updateUserStatus(userId: number, updateStatusDto: UpdateStatusDto): Promise<UserActivityStatus> {
    const existingStatus = await this.getUserStatus(userId);

    return this.prisma.userActivityStatus.update({
      where: { userId },
      data: {
        currentStatus: updateStatusDto.currentStatus,
        lastActivity: updateStatusDto.lastActivity ? new Date(updateStatusDto.lastActivity) : new Date(),
        currentApp: updateStatusDto.currentApp,
        currentWindow: updateStatusDto.currentWindow,
      },
    });
  }

  async getAllActiveUsers(): Promise<UserActivityStatus[]> {
    return this.prisma.userActivityStatus.findMany({
      where: {
        currentStatus: {
          in: [ActivityStatus.ACTIVE, ActivityStatus.IDLE],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  // ==================== 统计功能 ====================

  async getUserActivityStats(userId: number, date?: string): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await this.prisma.userActivity.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 计算各种统计数据
    const stats = {
      totalActivities: activities.length,
      totalDuration: activities.reduce((sum, activity) => sum + (activity.duration || 0), 0),
      applicationUsage: this.calculateApplicationUsage(activities),
      activityTimeline: this.generateActivityTimeline(activities),
      mostUsedApp: this.getMostUsedApplication(activities),
    };

    return stats;
  }

  private calculateApplicationUsage(activities: UserActivity[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    activities.forEach(activity => {
      if (activity.applicationName) {
        usage[activity.applicationName] = (usage[activity.applicationName] || 0) + (activity.duration || 0);
      }
    });

    return usage;
  }

  private generateActivityTimeline(activities: UserActivity[]): any[] {
    return activities.map(activity => ({
      time: activity.startTime,
      type: activity.activityType,
      app: activity.applicationName,
      window: activity.windowTitle,
      duration: activity.duration,
    }));
  }

  private getMostUsedApplication(activities: UserActivity[]): string | null {
    const usage = this.calculateApplicationUsage(activities);
    const entries = Object.entries(usage);
    
    if (entries.length === 0) return null;
    
    return entries.reduce((max, current) => current[1] > max[1] ? current : max)[0];
  }

  private getStatusFromActivityType(activityType: ActivityType): ActivityStatus {
    switch (activityType) {
      case ActivityType.APPLICATION_FOCUS:
      case ActivityType.WINDOW_CHANGE:
        return ActivityStatus.ACTIVE;
      case ActivityType.IDLE_START:
      case ActivityType.SYSTEM_LOCK:
        return ActivityStatus.IDLE;
      case ActivityType.IDLE_END:
      case ActivityType.SYSTEM_UNLOCK:
        return ActivityStatus.ACTIVE;
      default:
        return ActivityStatus.ACTIVE;
    }
  }

  // ==================== 实时数据清理 ====================

  async cleanupOldActivities(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.userActivity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
