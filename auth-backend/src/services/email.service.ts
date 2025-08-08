import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT')),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationCode(email: string, code: string, firstName?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello ${firstName || 'there'},</p>
          <p>Thank you for signing up! Please use the following verification code to verify your email address:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <h1 style="color: #007bff; letter-spacing: 3px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: 'Welcome to Our Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${firstName || 'to our platform'}!</h2>
          <p>Your email has been successfully verified and your account is now active.</p>
          <p>You can now access all features of our platform.</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}