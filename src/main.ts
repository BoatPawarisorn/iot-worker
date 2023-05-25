import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import apiConfig from './config/api.config';
import express = require('express');
import { Kafka } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
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
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth()
    // .addTag('auth')
    // .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: apiConfig.staticPrefixPath,
  });

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // Start Subscribe to the Kafka topic here
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['209.97.170.31:9092'],
  });
  const consumer = kafka.consumer({ groupId: 'ide-group' });
  await consumer.connect();
  await consumer.subscribe({ topics: ['ide-to-server', 'server-to-ide'], fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      Logger.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
  // End Subscribe

  app.enableCors();
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
