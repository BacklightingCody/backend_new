import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@/common/interceptors';
import { ErrorsInterceptor } from '@/common/interceptors';
import { CacheInterceptor } from '@/common/interceptors';
import { TimeoutInterceptor } from '@/common/interceptors';
import { AllExceptionFilter } from '@/common/filters/';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(helmet());  
  app.enableCors({                     // 允许跨域
    origin: ['http://localhost:5173', 'https://yourdomain.com'],
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalInterceptors(
    new CacheInterceptor(),       // 先缓存，有缓存直接返回，避免后续重复处理
    new TimeoutInterceptor(),     // 超时控制，保证请求不会无限等待
    new ErrorsInterceptor(),      // 捕获所有异常，保证统一错误响应结构
    new ResponseInterceptor(),    // 最后格式化所有正常响应的返回结构
  );


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
