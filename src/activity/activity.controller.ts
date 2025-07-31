import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req,
  Query,
  HttpStatus
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto, UpdateStatusDto } from './dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('activity')
@UseGuards(AuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // ==================== 活动记录接口 ====================

  @Post('activities')
  async createActivity(@Req() req: any, @Body() createActivityDto: CreateActivityDto) {
    const userId = req.user.id;
    const activity = await this.activityService.createActivity(userId, createActivityDto);
    
    return {
      success: true,
      data: activity,
      message: 'Activity recorded successfully',
    };
  }

  @Get('activities')
  async findUserActivities(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.id;
    const activities = await this.activityService.findUserActivities(
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      startDate,
      endDate
    );
    
    return {
      success: true,
      data: activities,
      message: 'Activities retrieved successfully',
    };
  }

  @Get('activities/:id')
  async findActivity(@Req() req: any, @Param('id') activityId: string) {
    const userId = req.user.id;
    const activity = await this.activityService.findActivityById(activityId, userId);
    
    return {
      success: true,
      data: activity,
      message: 'Activity retrieved successfully',
    };
  }

  @Patch('activities/:id')
  async updateActivity(
    @Req() req: any, 
    @Param('id') activityId: string, 
    @Body() updateData: Partial<CreateActivityDto>
  ) {
    const userId = req.user.id;
    const activity = await this.activityService.updateActivity(activityId, userId, updateData);
    
    return {
      success: true,
      data: activity,
      message: 'Activity updated successfully',
    };
  }

  @Delete('activities/:id')
  async deleteActivity(@Req() req: any, @Param('id') activityId: string) {
    const userId = req.user.id;
    await this.activityService.deleteActivity(activityId, userId);
    
    return {
      success: true,
      message: 'Activity deleted successfully',
    };
  }

  // ==================== 用户状态接口 ====================

  @Get('status')
  async getUserStatus(@Req() req: any) {
    const userId = req.user.id;
    const status = await this.activityService.getUserStatus(userId);
    
    return {
      success: true,
      data: status,
      message: 'User status retrieved successfully',
    };
  }

  @Patch('status')
  async updateUserStatus(@Req() req: any, @Body() updateStatusDto: UpdateStatusDto) {
    const userId = req.user.id;
    const status = await this.activityService.updateUserStatus(userId, updateStatusDto);
    
    return {
      success: true,
      data: status,
      message: 'User status updated successfully',
    };
  }

  @Get('status/all')
  async getAllActiveUsers() {
    const users = await this.activityService.getAllActiveUsers();
    
    return {
      success: true,
      data: users,
      message: 'Active users retrieved successfully',
    };
  }

  // ==================== 统计接口 ====================

  @Get('stats')
  async getUserActivityStats(
    @Req() req: any,
    @Query('date') date?: string
  ) {
    const userId = req.user.id;
    const stats = await this.activityService.getUserActivityStats(userId, date);
    
    return {
      success: true,
      data: stats,
      message: 'Activity statistics retrieved successfully',
    };
  }

  // ==================== 管理接口 ====================

  @Post('cleanup')
  async cleanupOldActivities(@Query('days') days?: string) {
    const daysToKeep = days ? parseInt(days) : 30;
    const deletedCount = await this.activityService.cleanupOldActivities(daysToKeep);
    
    return {
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old activities`,
    };
  }

  // ==================== 批量上报接口 ====================

  @Post('activities/batch')
  async createActivitiesBatch(@Req() req: any, @Body() activities: CreateActivityDto[]) {
    const userId = req.user.id;
    const results: Array<{ success: boolean; data?: any; error?: string }> = [];

    for (const activityDto of activities) {
      try {
        const activity = await this.activityService.createActivity(userId, activityDto);
        results.push({ success: true, data: activity });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return {
      success: true,
      data: results,
      message: 'Batch activities processed',
    };
  }
}
