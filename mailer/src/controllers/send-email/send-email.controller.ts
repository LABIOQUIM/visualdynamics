import { Body, Controller, Post } from '@nestjs/common';
import { SendMailProducerService } from 'src/producers/mail/jobs/sendMail-producer-service';
import { SendMailDTO } from './send-mail-dto';

@Controller('send-email')
export class SendEmailController {
  constructor(private mailService: SendMailProducerService) {}

  @Post('/')
  async sendMail(@Body() email: SendMailDTO) {
    this.mailService.sendMail(email);
  }
}
