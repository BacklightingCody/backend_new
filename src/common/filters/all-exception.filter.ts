import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessCodes } from '@constant/index'; // 根据你实际路径调整

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let businessCode = BusinessCodes.SYSTEM_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || '请求异常';

      // 映射业务错误码
      businessCode = this.mapHttpStatusToBusinessCode(status);
    }

    response.status(200).json({
      code: businessCode,
      message,
      path: request.url,
      timestamp: Date.now(),
    });
  }

  private mapHttpStatusToBusinessCode(status: number): number {
    const map = {
      400: BusinessCodes.BAD_REQUEST,
      401: BusinessCodes.UNAUTHORIZED,
      403: BusinessCodes.FORBIDDEN,
      404: BusinessCodes.NOT_FOUND,
      422: BusinessCodes.VALIDATION_ERROR,
      500: BusinessCodes.SYSTEM_ERROR,
    };

    return map[status] ?? BusinessCodes.SYSTEM_ERROR;
  }
}
