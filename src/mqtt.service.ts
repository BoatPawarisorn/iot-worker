import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService {
    publishMessage(topic: string, message: string): void {
        const client = mqtt.connect('mqtt://3.0.14.122:1883');
        client.publish(topic, message);
    }
}
