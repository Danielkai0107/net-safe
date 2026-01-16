import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 檢查環境變量
  console.log('🔍 Environment Variables Check:');
  console.log('  JWT_APP_SECRET:', process.env.JWT_APP_SECRET ? `${process.env.JWT_APP_SECRET.substring(0, 20)}...` : '❌ NOT SET');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  PORT:', process.env.PORT);
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  // 監聽所有網絡接口，讓 Android 模擬器可以連接
  await app.listen(port, '0.0.0.0');

  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🏥 Safe-Net API Server                             ║
  ║                                                       ║
  ║   🚀 Server: http://localhost:${port}/api              ║
  ║   📱 Mobile: http://10.0.2.2:${port}/api (Android)    ║
  ║   📚 Health: http://localhost:${port}/api/health       ║
  ║                                                       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
  ║   Database: Connected ✅                              ║
  ║   Listening: 0.0.0.0:${port} (All interfaces)         ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
