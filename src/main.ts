import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 中间件
  app.use(cookieParser.default());
  app.use(helmet());

  // CORS 配置
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'https://yourdomain.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 添加全局前缀
  app.setGlobalPrefix('api');

  // 全局过滤器和拦截器
  app.useGlobalInterceptors(new RequestLoggerInterceptor());
  // app.useGlobalFilters(new AllExceptionsFilter());
  // app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
