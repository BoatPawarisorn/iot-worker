import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as path from 'path';
import apiConfig from './config/api.config';
import express = require('express');
import { Kafka } from 'kafkajs';
import * as mqtt from 'mqtt';
import { KafkaService } from './kafka.service'
import { MqttService } from './mqtt.service'
import * as moment from 'moment'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const kafkaService = app.get<KafkaService>(KafkaService);
  const mqttService = app.get<MqttService>(MqttService);
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

  // Start Subscribe To The Kafka Topic Here
  const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['209.97.170.31:9092'],
  });
  const consumer = kafka.consumer({ groupId: 'ide-group' });
  await consumer.connect();
  await consumer.subscribe({ topics: ['api-to-worker', 'worker-to-kafka'], fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      Logger.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
      if (message.value.length > 0) {
        if (topic === "worker-to-kafka") {
          var data = JSON.parse(message.value.toString());
          console.log(data);
          // toDb(data);
        } else if (topic === "api-to-worker") {
          mqttService.publishMessage("worker-to-mqtt", "") // required data struct 
        }
      }
    },
  });
  // End Subscribe

  // Start Subscribe To The MQTT Topic Here
  const client = mqtt.connect('mqtt://3.0.14.122:1883');
  client.subscribe(["ide-to-worker"]); // topic from mqtt
  client.on("message", (topic, message) => {
    console.log(`Received message on topic ${topic}: ${message}`);
    try {
      // Start Create Queue To Kafka
      kafkaService.sendMessage("worker-to-kafka", {
        key: {
          cid: 0, // don't have client should add client id in message
        },
        value: {
          topic: topic,
          payload: message, // don't have packet.payload should add node payload in message
          cid: 0, // don't have client should add client id in message
          dt: moment().format("YYYY-MM-DD HH:mm:ss"),
        }
      })
      // End Queue
    } catch (error) {
      Logger.log(error)
    }
  });
  // End Subscribe

  app.enableCors();
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
