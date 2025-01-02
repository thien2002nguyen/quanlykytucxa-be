import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import * as https from 'https';
import {
  MomoPaymentCallback,
  MomoPaymentResponse,
  Payment,
  PaymentMethodEnum,
} from './interfaces/payments.interface';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from '../students/interfaces/students.interface';

@Injectable()
export class MomoService {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly partnerCode: string;
  private readonly redirectUrl: string;
  private readonly ipnUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel('Payment') private readonly paymentModel: Model<Payment>,
    @InjectModel('Student') private readonly studentModel: Model<Student>,
  ) {
    this.accessKey = this.configService.get<string>('MOMO_ACCESS_KEY', '');
    this.secretKey = this.configService.get<string>('MOMO_SECRET_KEY', '');
    this.partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE', '');
    this.redirectUrl = this.configService.get<string>('MOMO_REDIRECT_URL', '');
    this.ipnUrl = this.configService.get<string>('MOMO_IPN_URL', '');

    // Kiểm tra nếu thiếu bất kỳ biến nào
    if (!this.accessKey || !this.secretKey || !this.partnerCode) {
      throw new Error('Missing MOMO environment variables');
    }
  }

  async createPaymentMomo(
    amount: number,
    orderInfo: string,
  ): Promise<MomoPaymentResponse> {
    const orderId = this.partnerCode + new Date().getTime();
    const requestId = orderId;
    const requestType = 'payWithMethod';
    const extraData = '';
    const autoCapture = true;
    const lang = 'vi';
    const orderGroupId = '';

    // Create raw signature
    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Prepare request body
    const requestBody = JSON.stringify({
      partnerCode: this.partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount.toString(),
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });

    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const parsedBody = JSON.parse(responseBody);
            resolve(parsedBody);
          } catch (error) {
            reject(
              new HttpException(
                `Invalid response from MoMo: ${error}`,
                HttpStatus.BAD_GATEWAY,
              ),
            );
          }
        });
      });

      req.on('error', (error) => {
        reject(
          new HttpException(
            `Request error: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });

      req.write(requestBody);
      req.end();
    });
  }

  async handleMomoCallback(body: MomoPaymentCallback): Promise<void> {
    const { orderInfo, resultCode, amount } = body;

    // Kiểm tra kết quả thanh toán
    if (resultCode !== 0) {
      return;
    }

    // Tách chuỗi orderInfo thành mảng và lấy phần tử đầu tiên
    const studentCode = orderInfo.split(' ')[0];

    if (!studentCode) {
      return;
    }

    const student = await this.studentModel.findOne({ studentCode });

    if (!student) {
      return;
    }

    // Tìm tất cả các hóa đơn của sinh viên
    const payments = await this.paymentModel.find({ studentCode });

    if (!payments || payments.length === 0) {
      return;
    }

    // Số tiền còn lại cần xử lý
    let remainingAmount = amount;

    // Cập nhật từng hóa đơn
    for (const payment of payments) {
      const outstandingAmount = payment.remainingAmount || 0;

      if (remainingAmount <= 0) {
        break; // Nếu đã hết tiền thanh toán thì dừng
      }

      // Số tiền thanh toán cho hóa đơn hiện tại
      const paymentAmount = Math.min(remainingAmount, outstandingAmount);

      // Cập nhật hóa đơn
      payment.note = orderInfo;

      // Đẩy thông tin thanh toán vào lịch sử
      payment.paymentHistory.push({
        paymentMethod: PaymentMethodEnum.MOMO,
        amount: paymentAmount,
        paymentDate: new Date().toISOString(),
      });

      // Lưu thay đổi
      await payment.save();

      // Giảm số tiền còn lại cần xử lý
      remainingAmount -= paymentAmount;
    }
  }

  async checkPaymentStatus(orderId: string): Promise<any> {
    const requestId = `${this.partnerCode}${new Date().getTime()}`;

    // Tạo chữ ký (signature)
    const rawSignature = `accessKey=${this.accessKey}&orderId=${orderId}&partnerCode=${this.partnerCode}&requestId=${requestId}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Chuẩn bị request body
    const requestBody = JSON.stringify({
      partnerCode: this.partnerCode,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi',
    });

    const options = {
      hostname: 'test-payment.momo.vn', // Sử dụng endpoint của MoMo
      port: 443,
      path: '/v2/gateway/api/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const parsedBody = JSON.parse(responseBody);
            resolve(parsedBody);
          } catch (error) {
            reject(
              new HttpException(
                `Invalid response from MoMo: ${error}`,
                HttpStatus.BAD_GATEWAY,
              ),
            );
          }
        });
      });

      req.on('error', (error) => {
        reject(
          new HttpException(
            `Request error: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });

      req.write(requestBody);
      req.end();
    });
  }
}
