import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || request.ip || 'Unknown';

    // 记录请求开始
    this.logger.log(
      `🚀 请求开始 - ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`
    );

    // 打印请求体信息
    if (body && Object.keys(body).length > 0) {
      this.logger.log(`📝 请求体: ${JSON.stringify(body, null, 2)}`);
    }

    // 打印查询参数
    if (query && Object.keys(query).length > 0) {
      this.logger.log(`🔍 查询参数: ${JSON.stringify(query, null, 2)}`);
    }

    // 打印路径参数
    if (params && Object.keys(params).length > 0) {
      this.logger.log(`📍 路径参数: ${JSON.stringify(params, null, 2)}`);
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.log(
            `✅ 请求完成 - ${method} ${url} - 耗时: ${duration}ms`
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          this.logger.error(
            `❌ 请求失败 - ${method} ${url} - 耗时: ${duration}ms - 错误: ${error.message}`
          );
        },
      }),
    );
  }
}
