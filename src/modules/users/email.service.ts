import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Tạo transporter với dịch vụ email bạn muốn sử dụng
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Hoặc dịch vụ khác
      auth: {
        user: process.env.EMAIL_USER, // Địa chỉ email của bạn
        pass: process.env.EMAIL_PASS, // Mật khẩu hoặc app password
      },
    });
  }

  // Phương thức gửi OTP qua email
  async sendOtpEmail({
    to,
    title,
    content,
  }: {
    to: string;
    title: string;
    content: string;
  }): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: title,
      html: content,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
