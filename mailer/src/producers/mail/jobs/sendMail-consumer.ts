import { MailerService } from '@nestjs-modules/mailer';
import { OnQueueActive, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SendMailDTO } from 'src/controllers/send-email/send-mail-dto';

@Processor('mail-queue')
export class SendMailConsumer {
  constructor(private mailService: MailerService) {}

  @OnQueueActive()
  onActive(job: Job<SendMailDTO>) {
    console.log(
      `Processing job ${job.id} sending email with email ${job.data.to}...`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<Job>, error: Error) {
    console.log(`Error in job: ${job.id}. Error: ${error.message}`);
  }

  @Process('mail-job')
  async sendMailJob(job: Job<SendMailDTO>) {
    const { data } = job;

    await this.mailService.sendMail({
      to: data.to,
      from: data.from,
      subject: data.subject,
      template: '../../../templates/mail/main.hbs',
      context: {
        ...data.context,
      },
    });
  }
}
