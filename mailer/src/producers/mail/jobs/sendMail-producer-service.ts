import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { SendMailDTO } from 'src/controllers/send-email/send-mail-dto';

@Injectable()
export class SendMailProducerService {
  constructor(@InjectQueue('mail-queue') private mailQueue: Queue) {}

  async sendMail(email: SendMailDTO) {
    await this.mailQueue.add('mail-job', email);
  }
}
