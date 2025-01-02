import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as qs from 'qs';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { VnpayCallbackResponse } from './interfaces/payments.interface';

@Injectable()
export class VnpayService {
  private readonly vnpUrl: string;
  private readonly vnpSecretKey: string;
  private readonly vnpTmnCode: string;

  constructor(private readonly configService: ConfigService) {
    this.vnpUrl =
      this.configService.get<string>('VNP_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'; // Default if not in environment variables
    this.vnpSecretKey = this.configService.get<string>('VNP_SECRET_KEY');
    this.vnpTmnCode = this.configService.get<string>('VNP_TMN_CODE');

    if (!this.vnpSecretKey || !this.vnpTmnCode) {
      console.error(
        'VNP_SECRET_KEY or VNP_TMN_CODE environment variables are missing!',
      );
      throw new Error('Missing VNPay configuration');
    }
  }

  async createPaymentVNPAY(amount: number, orderInfo: string): Promise<string> {
    const params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpTmnCode,
      vnp_TxnRef: orderInfo,
      vnp_Amount: amount * 100, // Convert to VND (cent)
      vnp_TransactionDate: moment().format('YYYYMMDDHHmmss'),
      vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
      vnp_CurrCode: 'VND',
      vnp_OrderInfo: orderInfo,
      vnp_Locale: 'vn',
      vnp_ReturnUrl:
        this.configService.get<string>('VNP_RETURN_URL') ||
        'https://2b60-2402-800-6294-3e41-2168-2360-c7dd-dc0c.ngrok-free.app/api/payments/vnpay/callback', // Default callback URL
      vnp_IpAddr: '127.0.0.1', // Default IP address (you may need to get the real IP address in production)
      vnp_OrderType: 'other', // Make sure this matches the desired order type
    };

    // Sort the parameters in the defined order using sortObject
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    let key: string;
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    // Since key is expected to be a string, we can safely access params[key] as a string or number
    for (const key of str) {
      sorted[key] = encodeURIComponent(String(params[key])).replace(
        /%20/g,
        '+',
      );
    }

    // Generate the query string for the URL
    const queryString = qs.stringify(sorted, { encode: true });

    // Create the signature using HMAC-SHA512 with the secret key
    const signature = crypto
      .createHmac('sha512', this.vnpSecretKey)
      .update(queryString)
      .digest('hex');

    // Generate the payment URL with the signature
    const paymentUrl = `${this.vnpUrl}?${queryString}&vnp_SecureHash=${signature}`;

    return paymentUrl;
  }

  async handleVnpayCallback(
    queryParams: Record<string, string>,
  ): Promise<VnpayCallbackResponse> {
    try {
      const signature = queryParams['vnp_SecureHash'];
      const originalParams = { ...queryParams };
      delete originalParams['vnp_SecureHash']; // Remove the secure hash from original parameters

      // Recreate the signature from the parameters (used for comparison)
      const queryString = qs.stringify(originalParams);
      const computedSignature = crypto
        .createHmac('sha512', this.vnpSecretKey)
        .update(queryString)
        .digest('hex');

      // Compare the signature from the callback with the computed one
      if (signature !== computedSignature) {
        return {
          status: 'error',
          message: 'Invalid signature',
          vnpayData: queryParams,
        };
      }

      // Check the response code for success or failure
      if (queryParams['vnp_ResponseCode'] === '00') {
        return {
          status: 'success',
          message: 'Thanh toán thành công', // Payment successful
          vnpayData: queryParams,
        };
      } else {
        return {
          status: 'error',
          message: 'Thanh toán thất bại', // Payment failed
          vnpayData: queryParams,
        };
      }
    } catch (error: any) {
      // Handle unexpected errors
      return {
        status: 'error',
        message: error.message || 'Unknown error',
        vnpayData: queryParams,
      };
    }
  }
}
