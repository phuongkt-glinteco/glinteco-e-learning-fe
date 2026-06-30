import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMail(input: SendMailInput): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST') || 'localhost';
    const port = Number(this.configService.get<string>('SMTP_PORT') || 1025);
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') || 'no-reply@glinteco.com';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
    });

    try {
      const result = await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      this.logger.log(
        `Email sent to ${input.to} with subject "${input.subject}" messageId=${
          result.messageId ?? 'unknown'
        }`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${input.to} with subject "${input.subject}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException('Email service is unavailable');
    }
  }
}
