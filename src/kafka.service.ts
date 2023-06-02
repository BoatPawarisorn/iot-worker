import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService {
    async sendMessage(topic: string, message: any) {
        const kafka = new Kafka({
            clientId: 'my-app',
            brokers: [`${process.env.KAFKA_IP}:9092`],
        });

        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
            topic,
            // messages: [{ value: message }],
            messages: [{ value: JSON.stringify(message) }],
        });
        await producer.disconnect();
    }
}