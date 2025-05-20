import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessCodes } from '@constant/index';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // 你可以根据 error 类型，返回不同的 code 和 message
        let code = BusinessCodes.SYSTEM_ERROR;
        let message = '系统异常';

        // 举例，判断某些业务异常（你需要自己抛业务异常对象）
        if (error.status && error.message) {
          code = error.status; // 或者自定义映射
          message = error.message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        // 统一返回 200 状态的响应体格式
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        response.status(200).json({
          code,
          message,
          data: null,
          timestamp: Date.now(),
        });

        // 这里返回空 Observable，终止后续流程
        return of(null);
      }),
    );
  }
}
