import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'));

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());

  // ملفات الرفع (صور) — تُقدَّم خارج البادئة /api/v1
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/', index: false });

  app.enableCors({
    origin: config.get<string>('WEB_ORIGIN', 'http://localhost:3000').split(','),
    credentials: true,
    exposedHeaders: ['Authorization', 'Content-Disposition'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookly API')
    .setDescription('منصة حجز المزارع والفنادق والطيران والأنشطة السياحية')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'المصادقة')
    .addTag('properties', 'المزارع والفنادق')
    .addTag('flights', 'الطيران')
    .addTag('cars', 'تأجير السيارات')
    .addTag('trips', 'الرحلات السياحية')
    .addTag('bookings', 'الحجوزات')
    .addTag('wallet', 'المحفظة')
    .addTag('loyalty', 'المكافآت')
    .addTag('admin', 'الإدارة')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Bookly API Docs',
  });

  const port = config.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Bookly API يعمل على http://localhost:${port}/${config.get('API_PREFIX')}`);
  logger.log(`📚 التوثيق: http://localhost:${port}/docs`);
}

bootstrap();
