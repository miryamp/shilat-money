import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      whitelist: true, 
      forbidNonWhitelisted: true,
    }),
  );
  
  app.enableCors({
    origin: 'http://192.168.1.105:8080', // or use a function to dynamically check the origin
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
