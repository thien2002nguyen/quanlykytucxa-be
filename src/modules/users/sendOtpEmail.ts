export const mailOtp = (otp: string): string => `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .header img {
                width: 150px;
                height: auto;
              }
              .otp-container {
                background-color: #f9f9f9;  /* Nền xám siêu nhạt */
                padding: 20px;
                border: 2px solid #f0f0f0;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 20px;
              }
              .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #000;
                padding: 10px 20px;
                border-radius: 8px;
                display: inline-block;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #888888;
                margin-top: 20px;
              }
              .footer a {
                color: #888888;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://res.cloudinary.com/dguyawk5k/image/upload/v1731923862/logo_email/favicon_les0dz.ico" alt="Logo" />
              </div>
              <h2 style="text-align: center; color: #333;">Xác thực Email - Mã OTP</h2>
              <div class="otp-container">
                <p style="font-size: 18px; color: #555;">Mã OTP của bạn là:</p>
                <div class="otp-code">${otp}</div>
                <p style="font-size: 14px; color: #777;">Mã OTP sẽ hết hạn sau 5 phút.</p>
              </div>
              <div class="footer">
                <p>Chúc bạn một ngày tốt lành!</p>
                <p><a href="#">Hệ thống quản lý ký túc xá</a></p>
              </div>
            </div>
          </body>
        </html>
      `;
